# Meridian development static runner prerequisites

This is the complete host boundary for the repository-scoped runner labelled
`meridian-deploy`. The deployment publishes a static, content-addressed release;
it does not administer Nginx or any application infrastructure.

## One-time host provisioning by an administrator

- Create the dedicated OS user and primary group `meridian-deploy` with home
  `/home/meridian-deploy` and no membership in `sudo`, `docker`, or service
  operator groups.
- Register one GitHub Actions runner only with the `efolusi/meridian` repository.
  Its custom label set must include `meridian-deploy`; do not reuse the shared
  `efolusi` label. Use Linux x86-64 GitHub Actions runner `2.327.1` or newer,
  which is required by the pinned Node 24 runtime in `actions/checkout@v6`.
- Install NVM in `/home/meridian-deploy/.nvm` and Node `22.23.2`, matching
  `.nvmrc`. Install `git`, `curl`, `rsync`, `tar`, `readlink`, `stat`, and the
  compiler/runtime prerequisites required by `npm ci` and `npm run check`.
- Create `/var/www/efolusi/meridian-dev` as
  `meridian-deploy:meridian-deploy` mode `0755`. Its `releases/` directory and
  `current` symlink are the only persistent paths the runner may mutate.
- Install `nginx/dev-meridian.efolusi.com.conf` byte-for-byte at
  `/etc/nginx/sites-available/dev-meridian.efolusi.com` as `root:root` mode `0644`.
  Enable it with the root-owned symlink
  `/etc/nginx/sites-enabled/dev-meridian.efolusi.com` pointing to that file,
  then validate and reload Nginx once outside GitHub Actions.
- Keep `/var/www`, `/var/www/efolusi`, `/etc/nginx`, TLS keys, and every other
  product path non-writable by `meridian-deploy`.

## Runner environment and access

- `HOME` must be `/home/meridian-deploy`; `$HOME/.nvm/nvm.sh` must be readable.
- Outbound HTTPS is limited to GitHub Actions/checkouts, the npm registry needed
  by the exact lockfile, and the public `dev-meridian.efolusi.com` release probe.
- The origin probe requires local TCP access to `127.0.0.1:443`, but no Nginx
  control-plane permission.
- No repository or environment secrets are required by this workflow.
- No `sudo` permission, sudoers entry, or privileged command capability.
- No Docker socket, Docker group membership, container runtime, or image pull.
- No SSH private key, agent forwarding, remote shell, or host-to-host access.
- No database, object-storage, queue, or application secrets; no PostgreSQL,
  MinIO, Valkey, NATS, SSO, Pay, Meridian API, or Relay credentials.

The deploy script refuses to publish if the OS user, deploy-root ownership,
installed vhost bytes, vhost ownership, or enabled-vhost symlink differs from
this contract. Nginx configuration changes remain an administrator-reviewed,
out-of-band action; changing the immutable release symlink does not require an
Nginx reload.
