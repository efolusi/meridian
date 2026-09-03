#!/usr/bin/env bash
# Publish one immutable Meridian production release as an unprivileged runner.

set -Eeuo pipefail

domain="meridian.efolusi.com"
deploy_root="/var/www/efolusi/meridian-prod"
releases_root="${deploy_root}/releases"
available="/etc/nginx/sites-available/meridian.efolusi.com"
enabled="/etc/nginx/sites-enabled/meridian.efolusi.com"
runner_user="meridian-deploy"

[[ $# -eq 1 && "$1" =~ ^[0-9a-f]{40}$ ]] || {
  echo "usage: $0 <40-character-lowercase-git-sha>" >&2
  exit 64
}
release_sha="$1"

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

[[ "$(git rev-parse HEAD)" == "$release_sha" ]] || {
  echo "[meridian-prod] checkout does not match requested release" >&2
  exit 65
}
git diff --quiet
git diff --cached --quiet
[[ "$(id -un)" == "$runner_user" ]] || {
  echo "[meridian-prod] deployment must run as ${runner_user}" >&2
  exit 69
}

for command_name in cmp curl diff find grep readlink rsync stat tar; do
  command -v "$command_name" >/dev/null
done
[[ -x /usr/sbin/nginx ]]
[[ -x /usr/bin/sudo ]]

tracked_vhost="${repo_root}/nginx/meridian.efolusi.com.conf"
[[ -f "$available" && ! -L "$available" ]] || {
  echo "[meridian-prod] root-owned available vhost is missing or is a symlink" >&2
  exit 70
}
[[ "$(stat -c '%U:%G:%a' "$available")" == "root:root:644" ]] || {
  echo "[meridian-prod] available vhost must be root:root mode 0644" >&2
  exit 71
}
cmp --silent "$tracked_vhost" "$available" || {
  echo "[meridian-prod] installed vhost differs from tracked configuration" >&2
  exit 72
}
[[ -L "$enabled" && "$(readlink -f "$enabled")" == "$available" ]] || {
  echo "[meridian-prod] enabled vhost must point to the available vhost" >&2
  exit 73
}
[[ "$(stat -c '%U:%G' "$enabled")" == "root:root" ]] || {
  echo "[meridian-prod] enabled vhost symlink must be root-owned" >&2
  exit 74
}
[[ ! -w "$available" && ! -w "$enabled" ]] || {
  echo "[meridian-prod] runner must not mutate nginx configuration" >&2
  exit 75
}

# Validate the complete installed Nginx graph, including the real TLS include,
# before changing the production release pointer. The sudoers entry is limited
# to this read-only command and cannot reload or restart Nginx.
/usr/bin/sudo -n /usr/sbin/nginx -t

[[ -d "$deploy_root" && -w "$deploy_root" && -x "$deploy_root" ]] || {
  echo "[meridian-prod] deploy root is not writable by ${runner_user}" >&2
  exit 76
}
[[ "$(stat -c '%U:%G:%a' "$deploy_root")" == "${runner_user}:${runner_user}:755" ]] || {
  echo "[meridian-prod] deploy root ownership or mode differs" >&2
  exit 77
}
mkdir -p "$releases_root"

archive_dir="$(mktemp -d "${TMPDIR:-/tmp}/meridian-prod-archive.XXXXXX")"
publication_dir="$(mktemp -d "${TMPDIR:-/tmp}/meridian-prod-publication.XXXXXX")"
previous_current=""
deployment_started=false

cleanup() {
  rm -rf "$archive_dir" "$publication_dir"
}

rollback() {
  local status="${1:-$?}"
  trap - ERR
  set +e
  if [[ "$deployment_started" == true ]]; then
    if [[ -n "$previous_current" ]]; then
      rollback_link="$deploy_root/.current.rollback.$$"
      ln -s "$previous_current" "$rollback_link"
      mv -Tf "$rollback_link" "$deploy_root/current"
    else
      rm -f "$deploy_root/current"
    fi
  fi
  cleanup
  exit "$status"
}

trap cleanup EXIT
trap rollback ERR

# Publish only the static website surface from the exact commit. This allowlist
# is deliberately independent from .assetsignore: adding a tracked repository,
# workflow, test, package, or operator file must never make it web-accessible.
public_paths=(
  404.html
  hello.html
  index.html
  _ds_bundle.js
  _ds_manifest.json
  styles.css
  tailwind.preset.js
  registry.json
  llms.txt
  llms-full.txt
  robots.txt
  sitemap.xml
  assets
  blocks
  compatibility
  components
  guidelines
  showcases
  site
  skills
  starters
  tokens
)

git archive --format=tar "$release_sha" | tar -xf - -C "$archive_dir"
for public_path in "${public_paths[@]}"; do
  [[ -e "${archive_dir}/${public_path}" && ! -L "${archive_dir}/${public_path}" ]] || {
    echo "[meridian-prod] required public path is absent or a symlink: ${public_path}" >&2
    exit 78
  }
done
tar -C "$archive_dir" -cf - "${public_paths[@]}" | tar -C "$publication_dir" -xf -
if find "$publication_dir" -type l -print -quit | grep -q .; then
  echo "[meridian-prod] public static tree must not contain symlinks" >&2
  exit 80
fi
printf '%s\n' "$release_sha" > "${publication_dir}/meridian-release.txt"

test -s "${publication_dir}/index.html"
test -s "${publication_dir}/site/DsSite.dc.html"
test -s "${publication_dir}/_ds_bundle.js"
for forbidden_path in \
  .github .nvmrc CLAUDE.md nginx package.json package-lock.json scripts tests; do
  [[ ! -e "${publication_dir}/${forbidden_path}" ]] || {
    echo "[meridian-prod] non-public repository path reached publication: ${forbidden_path}" >&2
    exit 79
  }
done

if [[ -L "$deploy_root/current" ]]; then
  previous_current="$(readlink "$deploy_root/current")"
elif [[ -e "$deploy_root/current" ]]; then
  echo "[meridian-prod] current is not a symlink" >&2
  exit 67
fi

deployment_started=true
release="$releases_root/$release_sha"
if [[ -e "$release" ]]; then
  [[ -d "$release" && ! -L "$release" ]]
  [[ "$(cat "$release/meridian-release.txt")" == "$release_sha" ]]
  diff --recursive --brief --no-dereference "$publication_dir" "$release" >/dev/null
  [[ "$(stat -c '%U:%G:%a' "$release")" == "${runner_user}:${runner_user}:755" ]]
else
  candidate="$releases_root/.$release_sha.$$"
  install -d -m 0755 "$candidate"
  rsync -a --delete "${publication_dir}/" "${candidate}/"
  chmod 0755 "$candidate"
  [[ "$(stat -c '%U:%G:%a' "$candidate")" == "${runner_user}:${runner_user}:755" ]]
  test -s "$candidate/index.html"
  test -s "$candidate/site/DsSite.dc.html"
  test -s "$candidate/_ds_bundle.js"
  mv "$candidate" "$release"
fi
[[ "$(stat -c '%U:%G:%a' "$release")" == "${runner_user}:${runner_user}:755" ]]

next="$deploy_root/.current.$release_sha.$$"
ln -s "$release" "$next"
mv -Tf "$next" "$deploy_root/current"

probe_marker() {
  local mode="$1"
  local body
  if [[ "$mode" == origin ]]; then
    body="$(curl --fail --silent --show-error --insecure --max-time 5 \
      --resolve "${domain}:443:127.0.0.1" \
      "https://${domain}/meridian-release.txt?sha=${release_sha}")" || return 1
  else
    body="$(curl --fail --silent --show-error --max-time 10 \
      "https://${domain}/meridian-release.txt?sha=${release_sha}")" || return 1
  fi
  [[ "$body" == "$release_sha" ]]
}

for mode in origin public; do
  probe_result=FAIL
  for _ in {1..30}; do
    if probe_marker "$mode"; then
      probe_result=PASS
      break
    fi
    sleep 2
  done
  if [[ "$probe_result" != PASS ]]; then
    echo "[meridian-prod] ${mode} release-marker probe failed" >&2
    rollback 68
  fi
done

curl --fail --silent --show-error --insecure --max-time 5 \
  --resolve "${domain}:443:127.0.0.1" "https://${domain}/" >/dev/null
curl --fail --silent --show-error --max-time 10 "https://${domain}/" >/dev/null

trap - ERR
echo "[meridian-prod] deployed ${release_sha} to ${release}"
