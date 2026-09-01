# Meridian production static runner prerequisites

This is the complete host boundary for the repository-scoped runner labelled
`meridian-deploy`. Production publishes a static, content-addressed release; it
does not administer Nginx, Cloudflare, databases, queues, or application services.

## One-time host provisioning by an administrator

- Use the dedicated OS user and group `meridian-deploy`; it must not belong to
  the `docker` group or any application-service operator group.
- Register the runner only with `efolusi/meridian`, with label
  `meridian-deploy`, using GitHub Actions runner `2.327.1` or newer.
- Install NVM and Node `22.23.2` in `/home/meridian-deploy`, plus the exact
  commands checked by `scripts/deploy-prod-static.sh`.
- Create `/var/www/efolusi/meridian-prod` as
  `meridian-deploy:meridian-deploy` mode `0755`.
- Install `nginx/meridian.efolusi.com.conf` byte-for-byte at
  `/etc/nginx/sites-available/meridian.efolusi.com` as `root:root` mode `0644`,
  with a root-owned symlink at `/etc/nginx/sites-enabled/meridian.efolusi.com`.
- Permit only `sudo -n /usr/sbin/nginx -t` for `meridian-deploy`. Do not grant
  Nginx reload/restart, arbitrary sudo, shell, editor, or file-write commands.
- Keep `/etc/nginx`, TLS material, sibling products, and shared resources
  non-writable by `meridian-deploy`.

## Runtime boundary

- No repository/environment secret is required.
- No Docker socket, SSH private key, database, MinIO, Valkey, NATS, My/SSO,
  Pay, Relay, or other application credential is available to this runner.
- The runner may write only the production release directory and its `current`
  symlink. Failed probes restore the previous symlink; releases remain immutable.
- Origin health uses local `127.0.0.1:443`; public health uses
  `https://meridian.efolusi.com`.
