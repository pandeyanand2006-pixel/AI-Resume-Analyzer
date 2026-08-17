# MongoDB Security Checklist

- Use a managed MongoDB service or run behind a private VPC/subnet.
- Do NOT use the admin/root user for application connections; create a dedicated least-privilege user.
- Enable authentication and strong passwords for all database users.
- Use TLS/SSL for all connections to the database (enable TLS on server and require TLS in clients).
- Restrict network access (IP allowlist) so only application servers can reach the DB.
- Rotate credentials regularly and store secrets in a secure vault (e.g., AWS Secrets Manager, Azure Key Vault).
- Do not commit `MONGO_URI` or other secrets to version control; keep them in `.env` which is in `.gitignore`.
- Use role-based access control: grant only required actions (read/write) on needed databases/collections.
- Enable database auditing and logging; monitor for suspicious queries or failed auth attempts.
- Backup frequently and test restores; keep backups encrypted and access-controlled.
- If using MongoDB Atlas, enable IP access lists, use VPC peering, and enable advanced security features (Encryption at Rest, Advanced Threat Detection).
- Limit database user permissions used by background jobs or analytics.
- Keep MongoDB server and drivers up-to-date to receive security patches.
- For production, prefer single-purpose databases per environment (dev/stage/prod) with separate credentials.

Quick checks to run:
- Confirm `process.env.MONGO_URI` does not contain credentials in source code.
- Run `db.getUsers()` in the database shell to audit users and roles.
- Verify TLS is enforced by checking connection string uses `mongodb+srv`/`ssl=true` or similar.

