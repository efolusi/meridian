# Meridian production static runner prerequisites

Production releases run on the shared Efolusi organization runner labelled
`efolusi-prod`, as the OS user `deploy`. Production publishes a static,
content-addressed release; it does not administer Nginx, Cloudflare, databases,
queues, or application services.

## One-time host provisioning by an administrator

- The `efolusi-prod` runner is registered at the `efolusi` organization level
  and serves only `main`-branch deploys, using GitHub Actions runner `2.327.1`
  or newer.
- Install NVM and Node `22.23.2` in `/home/deploy`, plus the exact commands
  checked by `scripts/deploy-prod-static.sh`.
- Create `/var/www/efolusi/meridian-prod` as `deploy:deploy` mode `0755`.
- Install `nginx/meridian.efolusi.com.conf` byte-for-byte at
  `/etc/nginx/sites-available/meridian.efolusi.com` as `root:root` mode `0644`,
  with a root-owned symlink at `/etc/nginx/sites-enabled/meridian.efolusi.com`.
- The workflow needs only `sudo -n /usr/sbin/nginx -t`. Do not grant
  Nginx reload/restart to this workflow's steps.

## Runtime boundary

- No repository/environment secret is required.
- No Docker socket, SSH key, database, MinIO, Valkey, NATS, My/SSO, Pay, or
  Relay credential is used by this workflow. The shared `deploy` user holds
  broader host access for other products; the boundary here is the script's
  checks, not an isolated OS user.
- The workflow writes only the production release directory and its `current`
  symlink. Failed probes restore the previous symlink; releases remain immutable.
- Origin health uses local `127.0.0.1:443`; public health uses
  `https://meridian.efolusi.com`.
