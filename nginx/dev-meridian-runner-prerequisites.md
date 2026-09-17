# Meridian development static runner prerequisites

Development releases run on the shared Efolusi organization runner labelled
`efolusi-dev`, as the OS user `deploy`. The deployment publishes a static,
content-addressed release; it does not administer Nginx or any application
infrastructure.

## One-time host provisioning by an administrator

- The `efolusi-dev` runner is registered at the `efolusi` organization level and
  serves CI and development deploys for every product, one job at a time.
  Use Linux x86-64 GitHub Actions runner `2.327.1` or newer, which is required
  by the pinned Node 24 runtime in `actions/checkout@v6`.
- Install NVM in `/home/deploy/.nvm` and Node `22.23.2`, matching `.nvmrc`.
  Install `git`, `curl`, `rsync`, `tar`, `readlink`, `stat`, and the
  compiler/runtime prerequisites required by `npm ci` and `npm run check`.
- Create `/var/www/efolusi/meridian-dev` as `deploy:deploy` mode `0755`. Its
  `releases/` directory and `current` symlink are the only persistent paths
  this workflow mutates.
- Install `nginx/dev-meridian.efolusi.com.conf` byte-for-byte at
  `/etc/nginx/sites-available/dev-meridian.efolusi.com` as `root:root` mode `0644`.
  Enable it with the root-owned symlink
  `/etc/nginx/sites-enabled/dev-meridian.efolusi.com` pointing to that file,
  then validate and reload Nginx once outside GitHub Actions.

## Runner environment and access

- `HOME` must be `/home/deploy`; `$HOME/.nvm/nvm.sh` must be readable.
- The origin probe requires local TCP access to `127.0.0.1:443`, but no Nginx
  control-plane permission.
- No repository or environment secrets are required by this workflow, and the
  workflow and deploy script invoke no `sudo`, Docker, or SSH commands.
- The `deploy` user is shared with other products and does hold broader host
  access (Docker group, limited sudoers entries, product environment files).
  This workflow's boundary is enforced by the script checks below, not by an
  isolated OS user.

The deploy script refuses to publish if the OS user, deploy-root ownership,
installed vhost bytes, vhost ownership, or enabled-vhost symlink differs from
this contract. Nginx configuration changes remain an administrator-reviewed,
out-of-band action; changing the immutable release symlink does not require an
Nginx reload.
