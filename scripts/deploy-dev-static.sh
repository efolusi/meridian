#!/usr/bin/env bash
# Publish one immutable Meridian development release and install its exact vhost.

set -Eeuo pipefail

domain="dev-meridian.efolusi.com"
deploy_root="/var/www/efolusi/meridian-dev"
releases_root="${deploy_root}/releases"
available="/etc/nginx/sites-available/dev-meridian.efolusi.com"
enabled="/etc/nginx/sites-enabled/dev-meridian.efolusi.com"

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

command -v sudo >/dev/null
command -v rsync >/dev/null
docker=(sudo -n /usr/bin/docker)
"${docker[@]}" image inspect alpine:3.20 >/dev/null

archive_dir="$(mktemp -d "${TMPDIR:-/tmp}/meridian-dev-archive.XXXXXX")"
publication_dir="$(mktemp -d "${TMPDIR:-/tmp}/meridian-dev-publication.XXXXXX")"
backup_dir="$(mktemp -d "${TMPDIR:-/tmp}/meridian-dev-nginx.XXXXXX")"
previous_current=""
had_available=false
had_enabled=false
deployment_started=false

write_root_file() {
  local source_file="$1"
  local destination="$2"
  # The redirect reads a deploy-owned source; only tee needs elevated rights.
  # shellcheck disable=SC2024
  sudo -n /usr/bin/tee "$destination" < "$source_file" >/dev/null
}

cleanup() {
  rm -rf "$archive_dir" "$publication_dir" "$backup_dir"
}

rollback() {
  local status=$?
  trap - ERR
  set +e
  if [[ "$deployment_started" == true ]]; then
    # The variables below intentionally expand inside the isolated container.
    # shellcheck disable=SC2016
    "${docker[@]}" run --rm \
      -v /var/www/efolusi:/var/www/efolusi \
      -e PREVIOUS_CURRENT="$previous_current" \
      alpine:3.20 sh -eu -c '
        root=/var/www/efolusi/meridian-dev
        mkdir -p "$root"
        if [ -n "$PREVIOUS_CURRENT" ]; then
          rollback_link="$root/.current.rollback.$$"
          ln -s "$PREVIOUS_CURRENT" "$rollback_link"
          mv -Tf "$rollback_link" "$root/current"
        else
          rm -f "$root/current"
        fi
      '

    if [[ "$had_available" == true ]]; then
      write_root_file "${backup_dir}/available" "$available"
    else
      printf '%s\n' '# Meridian development vhost rollback: no prior config.' | \
        sudo -n /usr/bin/tee "$available" >/dev/null
    fi

    if [[ "$had_enabled" == true ]]; then
      write_root_file "${backup_dir}/enabled" "$enabled"
    else
      printf '%s\n' '# Meridian development vhost rollback: no prior config.' | \
        sudo -n /usr/bin/tee "$enabled" >/dev/null
    fi

    sudo -n /usr/sbin/nginx -t && sudo -n /usr/bin/systemctl reload nginx
  fi
  cleanup
  exit "$status"
}

trap cleanup EXIT
trap rollback ERR

# Archive the exact commit, not the working directory: npm's ignored build
# outputs and runner leftovers can never leak into the published static tree.
git archive --format=tar "$release_sha" | tar -xf - -C "$archive_dir"
rsync -a --delete --exclude-from="${archive_dir}/.assetsignore" \
  "${archive_dir}/" "${publication_dir}/"
printf '%s\n' "$release_sha" > "${publication_dir}/meridian-release.txt"

test -s "${publication_dir}/index.html"
test -s "${publication_dir}/site/DsSite.dc.html"
test -s "${publication_dir}/_ds_bundle.js"

if sudo -n /usr/bin/test -e "$available"; then
  cp "$available" "${backup_dir}/available"
  had_available=true
fi
if sudo -n /usr/bin/test -L "$enabled"; then
  echo "[meridian-dev] refusing to replace symlink ${enabled}" >&2
  exit 66
elif sudo -n /usr/bin/test -e "$enabled"; then
  cp "$enabled" "${backup_dir}/enabled"
  had_enabled=true
fi

# The variables below intentionally expand inside the isolated container.
# shellcheck disable=SC2016
previous_current="$("${docker[@]}" run --rm \
  -v /var/www/efolusi:/var/www/efolusi \
  alpine:3.20 sh -eu -c '
    current=/var/www/efolusi/meridian-dev/current
    if [ -L "$current" ]; then
      readlink "$current"
    elif [ -e "$current" ]; then
      echo "current is not a symlink" >&2
      exit 67
    fi
  ')"

deployment_started=true
write_root_file "${repo_root}/nginx/dev-meridian.efolusi.com.conf" "$available"
write_root_file "${repo_root}/nginx/dev-meridian.efolusi.com.conf" "$enabled"

# The variables below intentionally expand inside the isolated container.
# shellcheck disable=SC2016
"${docker[@]}" run --rm \
  -v "${publication_dir}:/source:ro" \
  -v /var/www/efolusi:/var/www/efolusi \
  -e RELEASE_SHA="$release_sha" \
  alpine:3.20 sh -eu -c '
    root=/var/www/efolusi/meridian-dev
    releases="$root/releases"
    release="$releases/$RELEASE_SHA"
    mkdir -p "$releases"
    if [ -e "$release" ]; then
      [ "$(cat "$release/meridian-release.txt")" = "$RELEASE_SHA" ]
    else
      candidate="$releases/.$RELEASE_SHA.$$"
      mkdir "$candidate"
      cp -a /source/. "$candidate/"
      test -s "$candidate/index.html"
      test -s "$candidate/site/DsSite.dc.html"
      test -s "$candidate/_ds_bundle.js"
      mv "$candidate" "$release"
    fi
    next="$root/.current.$RELEASE_SHA.$$"
    ln -s "$release" "$next"
    mv -Tf "$next" "$root/current"
  '

release_dir="${releases_root}/${release_sha}"
sudo -n /usr/sbin/nginx -t
sudo -n /usr/bin/systemctl reload nginx

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
  [[ "$probe_result" == PASS ]] || {
    echo "[meridian-dev] ${mode} release-marker probe failed" >&2
    exit 68
  }
done

curl --fail --silent --show-error --insecure --max-time 5 \
  --resolve "${domain}:443:127.0.0.1" "https://${domain}/" >/dev/null
curl --fail --silent --show-error --max-time 10 "https://${domain}/" >/dev/null

trap - ERR
echo "[meridian-dev] deployed ${release_sha} to ${release_dir}"
