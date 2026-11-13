#!/usr/bin/env bash
# Publish one immutable Meridian development release as an unprivileged runner.

set -Eeuo pipefail

domain="dev-meridian.efolusi.com"
deploy_root="/var/www/efolusi/meridian-dev"
releases_root="${deploy_root}/releases"
available="/etc/nginx/sites-available/dev-meridian.efolusi.com"
enabled="/etc/nginx/sites-enabled/dev-meridian.efolusi.com"
runner_user="deploy"
keep_releases=5

[[ $# -eq 1 && "$1" =~ ^[0-9a-f]{40}$ ]] || {
  echo "usage: $0 <40-character-lowercase-git-sha>" >&2
  exit 64
}
release_sha="$1"

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

actual_sha="$(git rev-parse HEAD)"
[[ "$actual_sha" == "$release_sha" ]] || {
  echo "[meridian-dev] checkout ${actual_sha} does not match requested ${release_sha}" >&2
  exit 65
}
git diff --quiet
git diff --cached --quiet

[[ "$(id -un)" == "$runner_user" ]] || {
  echo "[meridian-dev] deployment must run as ${runner_user}" >&2
  exit 69
}

for command_name in cmp curl find grep readlink rsync stat tar; do
  command -v "$command_name" >/dev/null
done

# Nginx is provisioned once by an administrator. The repository runner may
# verify this control-plane state, but it cannot change or reload it.
tracked_vhost="${repo_root}/nginx/dev-meridian.efolusi.com.conf"
[[ -f "$available" && ! -L "$available" ]] || {
  echo "[meridian-dev] root-owned available vhost is missing or is a symlink" >&2
  exit 70
}
[[ "$(stat -c '%U:%G:%a' "$available")" == "root:root:644" ]] || {
  echo "[meridian-dev] available vhost must be root:root mode 0644" >&2
  exit 71
}
cmp --silent "$tracked_vhost" "$available" || {
  echo "[meridian-dev] installed vhost differs from tracked configuration" >&2
  exit 72
}
[[ -L "$enabled" && "$(readlink -f "$enabled")" == "$available" ]] || {
  echo "[meridian-dev] enabled vhost must point to the available vhost" >&2
  exit 73
}
[[ "$(stat -c '%U:%G' "$enabled")" == "root:root" ]] || {
  echo "[meridian-dev] enabled vhost symlink must be root-owned" >&2
  exit 74
}
[[ ! -w "$available" && ! -w "$enabled" ]] || {
  echo "[meridian-dev] runner must not be able to mutate nginx configuration" >&2
  exit 75
}
# The vhost includes these; a missing or stale copy changes the served headers.
for snippet in meridian-cors.conf meridian-security-headers.conf; do
  installed="/etc/nginx/snippets/${snippet}"
  if ! { [[ -f "$installed" && ! -L "$installed" && ! -w "$installed" ]] \
    && [[ "$(stat -c '%U:%G:%a' "$installed")" == "root:root:644" ]] \
    && cmp --silent "${repo_root}/nginx/snippets/${snippet}" "$installed"; }; then
    echo "[meridian-dev] installed snippet ${snippet} is missing, not root:root 0644, or differs from tracked" >&2
    exit 81
  fi
done
[[ -d "$deploy_root" && -w "$deploy_root" && -x "$deploy_root" ]] || {
  echo "[meridian-dev] ${deploy_root} must be writable by ${runner_user}" >&2
  exit 76
}
[[ "$(stat -c '%U:%G:%a' "$deploy_root")" == "${runner_user}:${runner_user}:755" ]] || {
  echo "[meridian-dev] deploy root must be ${runner_user}:${runner_user} mode 0755" >&2
  exit 77
}
mkdir -p "$releases_root"

archive_dir="$(mktemp -d "${TMPDIR:-/tmp}/meridian-dev-archive.XXXXXX")"
publication_dir="$(mktemp -d "${TMPDIR:-/tmp}/meridian-dev-publication.XXXXXX")"
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

# Keep the newest N releases by mtime plus the one current points to; only
# 40-hex release names are touched, never an in-flight .<sha>.<pid> candidate.
prune_releases() {
  local keep="$1" current_target kept=0 dir
  current_target="$(cd "$deploy_root/current" 2>/dev/null && pwd -P || true)"
  while IFS= read -r dir; do
    dir="${dir%/}"
    [[ "$(basename "$dir")" =~ ^[0-9a-f]{40}$ ]] || continue
    [[ "$(cd "$dir" && pwd -P)" != "$current_target" ]] || continue
    if (( kept < keep )); then
      kept=$((kept + 1))
      continue
    fi
    rm -rf -- "$dir"
  done < <(ls -1td -- "$releases_root"/*/ 2>/dev/null)
}

trap cleanup EXIT
trap rollback ERR

# Archive the exact commit, not the working directory: ignored build outputs
# and runner leftovers can never leak into the published static tree.
# The allowlist must equal production's, so dev previews exactly what prod serves.
public_paths=(
  404.html
  hello.html
  index.html
  _ds_bundle.js
  _ds_manifest.json
  styles.css
  landing.css
  tailwind.preset.js
  tokens.json
  registry.json
  llms.txt
  llms-full.txt
  README.md
  ARCHITECTURE.md
  CHANGELOG.md
  CONTRIBUTING.md
  SECURITY.md
  LICENSE
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
    echo "[meridian-dev] required public path is absent or a symlink: ${public_path}" >&2
    exit 78
  }
done
tar -C "$archive_dir" -cf - "${public_paths[@]}" | tar -C "$publication_dir" -xf -
if find "$publication_dir" -type l -print -quit | grep -q .; then
  echo "[meridian-dev] public static tree must not contain symlinks" >&2
  exit 80
fi
printf '%s\n' "$release_sha" > "${publication_dir}/meridian-release.txt"

test -s "${publication_dir}/index.html"
test -s "${publication_dir}/site/DsSite.dc.html"
test -s "${publication_dir}/_ds_bundle.js"
for forbidden_path in \
  .github .nvmrc CLAUDE.md nginx package.json package-lock.json scripts tests; do
  [[ ! -e "${publication_dir}/${forbidden_path}" ]] || {
    echo "[meridian-dev] non-public repository path reached publication: ${forbidden_path}" >&2
    exit 79
  }
done

if [[ -L "$deploy_root/current" ]]; then
  previous_current="$(readlink "$deploy_root/current")"
elif [[ -e "$deploy_root/current" ]]; then
  echo "[meridian-dev] current is not a symlink" >&2
  exit 67
fi

deployment_started=true
release="$releases_root/$release_sha"
if [[ -e "$release" ]]; then
  [[ -d "$release" && ! -L "$release" ]]
  [[ "$(cat "$release/meridian-release.txt")" == "$release_sha" ]]
  chmod 0755 "$release"
  [[ "$(stat -c '%U:%G:%a' "$release")" == "${runner_user}:${runner_user}:755" ]]
else
  candidate="$releases_root/.$release_sha.$$"
  install -d -m 0755 "$candidate"
  rsync -a --delete "${publication_dir}/" "${candidate}/"
  # rsync archive mode copies the mktemp source directory's restrictive mode
  # onto the destination root. Restore and verify the public traversal mode
  # only after the final byte copy.
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
release_dir="${releases_root}/${release_sha}"

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
    echo "[meridian-dev] ${mode} release-marker probe failed" >&2
    rollback 68
  fi
done

curl --fail --silent --show-error --insecure --max-time 5 \
  --resolve "${domain}:443:127.0.0.1" "https://${domain}/" >/dev/null
curl --fail --silent --show-error --max-time 10 "https://${domain}/" >/dev/null

trap - ERR
prune_releases "$keep_releases" || echo "[meridian-dev] warning: pruning old releases failed" >&2
echo "[meridian-dev] deployed ${release_sha} to ${release_dir}"
