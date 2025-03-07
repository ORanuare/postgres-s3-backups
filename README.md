# Postgres S3 backups

A simple NodeJS application to backup your PostgreSQL database to S3 via a cron or webhook.

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template/I4zGrH)

## Configuration

- `AWS_ACCESS_KEY_ID` - AWS access key ID.

- `AWS_SECRET_ACCESS_KEY` - AWS secret access key, sometimes also called an application key.

- `AWS_S3_BUCKET` - The name of the bucket that the access key ID and secret access key are authorized to access.

- `AWS_S3_REGION` - The name of the region your bucket is located in, set to `auto` if unknown.

- `BACKUP_DATABASE_URL` - The connection string of the database to backup.

- `BACKUP_CRON_SCHEDULE` - The cron schedule to run the backup on. Example: `0 5 * * *`

- `WEBHOOK_SECRET` - Secret password to validate webhook requests. If set, a webhook server will be started.

- `WEBHOOK_PORT` - Fallback port to run the webhook server on if the platform's `PORT` environment variable is not available. Default: `3000`

- `AWS_S3_ENDPOINT` - The S3 custom endpoint you want to use. Applicable for 3-rd party S3 services such as Cloudflare R2 or Backblaze R2.

- `AWS_S3_FORCE_PATH_STYLE` - Use path style for the endpoint instead of the default subdomain style, useful for MinIO. Default `false`

- `RUN_ON_STARTUP` - Run a backup on startup of this application then proceed with making backups on the set schedule.

- `BACKUP_FILE_PREFIX` - Add a prefix to the file name.

- `BUCKET_SUBFOLDER` - Define a subfolder to place the backup files in.

- `SINGLE_SHOT_MODE` - Run a single backup on start and exit when completed. Useful with the platform's native CRON schedular.

- `SUPPORT_OBJECT_LOCK` - Enables support for buckets with object lock by providing an MD5 hash with the backup file.

- `BACKUP_OPTIONS` - Add any valid pg_dump option, supported pg_dump options can be found [here](https://www.postgresql.org/docs/current/app-pgdump.html). Example: `--exclude-table=pattern`

- `S3_OBJECT_EXPIRES_DAYS` - Number of days until the object expires in S3. Used to set the 'Expires' header on objects, which can be utilized for S3 lifecycle rules.

## Webhook Usage

When `WEBHOOK_SECRET` is set, a webhook server will be started on the specified port. The webhook endpoint is available at:

```
POST /webhook/backup?secret=YOUR_WEBHOOK_SECRET
```

This endpoint will trigger a backup when called with the correct secret. The secret is passed as a query parameter because some webhook providers do not allow custom headers.

Responses:
- 200 OK: Backup completed successfully
- 403 Forbidden: Invalid secret
- 500 Internal Server Error: Backup failed

A simple health check endpoint is also available at:
```
GET /health
```
