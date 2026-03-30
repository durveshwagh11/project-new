# AWS Deployment Guide

This guide covers deploying the application to AWS using different strategies.

## Prerequisites

Before deploying to AWS, ensure you have:

- [x] AWS Account with appropriate permissions
- [x] AWS CLI installed and configured
- [x] Docker installed locally
- [x] All environment variables configured
- [x] Database migrations ready

## Environment Variables

### Required Production Variables

Create a `.env` file in the project root (use `.env.example` as template):

```env
# Database (AWS RDS)
DATABASE_URL=postgresql://username:password@your-rds-endpoint.region.rds.amazonaws.com:5432/database_name

# JWT Secrets (CRITICAL - use strong random values)
JWT_ACCESS_SECRET=<generate-secure-32-character-minimum-secret>
JWT_REFRESH_SECRET=<generate-secure-32-character-minimum-secret>

# Optional
JWT_ACCESS_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=https://yourdomain.com
```

### Generate Secure Secrets

```bash
# Generate secure random secrets
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Deployment Options

### Option 1: AWS ECS Fargate (Recommended)

Best for containerized applications with Docker Compose compatibility.

#### Architecture
- **Application Load Balancer** → Routes traffic to services
- **ECS Fargate** → Runs containers (frontend, backend, nginx)
- **RDS PostgreSQL** → Managed database
- **ECR** → Container registry
- **Secrets Manager** → Stores sensitive configuration

#### Steps

1. **Create Infrastructure** (use Terraform/CDK - see `infrastructure/` directory)
2. **Build & Push Images to ECR**
   ```bash
   # Login to ECR
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

   # Build and push
   docker build -f deployment/docker/backend/Dockerfile -t <account-id>.dkr.ecr.us-east-1.amazonaws.com/backend:latest .
   docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/backend:latest

   docker build -f deployment/docker/frontend/Dockerfile -t <account-id>.dkr.ecr.us-east-1.amazonaws.com/frontend:latest .
   docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/frontend:latest
   ```

3. **Create RDS Database**
   ```bash
   # Use AWS Console or Terraform
   # Note: Save connection string for DATABASE_URL
   ```

4. **Run Database Migrations**
   ```bash
   # Set DATABASE_URL to point to RDS
   export DATABASE_URL=postgresql://...
   pnpm migrate:prod
   ```

5. **Deploy to ECS**
   - Create ECS cluster
   - Create task definitions for frontend and backend
   - Create services with ALB integration
   - Configure auto-scaling

#### Cost Estimate (Monthly)
- ALB: ~$16
- ECS Fargate (2 tasks, 0.5 vCPU, 1GB): ~$30
- RDS (db.t4g.micro): ~$15
- **Total: ~$60-70/month**

---

### Option 2: AWS App Runner (Easiest)

Simplest option for containerized apps with auto-scaling.

#### Steps

1. **Push images to ECR** (same as Option 1, step 2)
2. **Create RDS Database** (same as Option 1, step 3)
3. **Create App Runner Services**
   ```bash
   # Backend
   aws apprunner create-service \
     --service-name durvesh-backend \
     --source-configuration '{
       "ImageRepository": {
         "ImageIdentifier": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/backend:latest",
         "ImageRepositoryType": "ECR"
       }
     }' \
     --instance-configuration '{
       "Cpu": "1 vCPU",
       "Memory": "2 GB"
     }' \
     --health-check-configuration '{
       "Protocol": "HTTP",
       "Path": "/api/health"
     }'

   # Frontend (similar command)
   ```

4. **Configure environment variables** in App Runner console
5. **Run migrations** (same as Option 1, step 4)

#### Cost Estimate (Monthly)
- App Runner (2 services): ~$40-50
- RDS: ~$15
- **Total: ~$55-65/month**

---

### Option 3: AWS Elastic Beanstalk

Good for Docker Compose deployments with minimal configuration.

#### Steps

1. **Install EB CLI**
   ```bash
   pip install awsebcli
   ```

2. **Initialize Elastic Beanstalk**
   ```bash
   eb init -p docker durvesh-project --region us-east-1
   ```

3. **Create RDS Database** (via EB or separately)
4. **Set environment variables**
   ```bash
   eb setenv DATABASE_URL=postgresql://... JWT_ACCESS_SECRET=...
   ```

5. **Deploy**
   ```bash
   eb create durvesh-production
   eb deploy
   ```

#### Cost Estimate (Monthly)
- EC2 (t3.small): ~$15
- RDS: ~$15
- Load Balancer: ~$16
- **Total: ~$45-50/month**

---

## Database Migration

### Initial Setup

1. **Run migrations on production database**
   ```bash
   # Set production DATABASE_URL
   export DATABASE_URL=postgresql://user:pass@rds-endpoint:5432/dbname

   # Run migrations
   pnpm migrate:prod
   ```

### Adding New Migrations

1. Create new SQL file in `apps/backend/src/migrations/`
   ```sql
   -- 002_add_posts_table.sql
   CREATE TABLE IF NOT EXISTS posts (
     id SERIAL PRIMARY KEY,
     title VARCHAR(255) NOT NULL,
     content TEXT,
     user_id INTEGER REFERENCES users(id),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

2. Run migration
   ```bash
   pnpm migrate:prod
   ```

---

## Security Checklist

Before going live:

- [ ] Change all default secrets in `.env`
- [ ] Use AWS Secrets Manager for sensitive data
- [ ] Enable SSL/TLS (use AWS Certificate Manager)
- [ ] Configure security groups (only necessary ports)
- [ ] Enable RDS encryption at rest
- [ ] Set up VPC with private subnets for database
- [ ] Enable CloudWatch logging
- [ ] Configure CORS properly in backend
- [ ] Set up backup policy for RDS
- [ ] Enable AWS WAF for DDoS protection (optional)

---

## Monitoring & Logging

### CloudWatch Logs

Configure log groups for:
- Backend application logs
- Frontend access logs
- Database slow query logs
- ALB access logs

### Health Checks

- Backend: `GET /api/health`
- Frontend: `GET /`

Both containers have built-in Docker HEALTHCHECK configurations.

---

## CI/CD Integration

The GitHub Actions workflow (`.github/workflows/ci.yml`) already builds and pushes Docker images to GHCR.

### To deploy from CI/CD:

1. **Switch from GHCR to ECR**
   - Update workflow to push to ECR instead
   - Add AWS credentials to GitHub Secrets

2. **Add deployment step**
   ```yaml
   - name: Deploy to ECS
     run: |
       aws ecs update-service --cluster durvesh-cluster --service backend --force-new-deployment
       aws ecs update-service --cluster durvesh-cluster --service frontend --force-new-deployment
   ```

---

## Rollback Strategy

### ECS/App Runner
```bash
# List previous task definitions
aws ecs list-task-definitions --family-prefix backend

# Update service to previous version
aws ecs update-service --cluster durvesh-cluster --service backend --task-definition backend:123
```

### Database
- Always test migrations on staging first
- Keep database backups (automated RDS snapshots)
- Write reversible migrations when possible

---

## Cost Optimization

- Use **RDS Reserved Instances** for production (save ~40%)
- Enable **ECS Fargate Spot** for non-critical workloads
- Use **CloudFront CDN** for static assets
- Set up **auto-scaling** to scale down during low traffic
- Monitor costs with **AWS Cost Explorer**

---

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check security group allows inbound from ECS tasks
   - Verify DATABASE_URL is correct
   - Check RDS is in same VPC or publicly accessible

2. **Container Won't Start**
   - Check CloudWatch logs
   - Verify environment variables are set
   - Check health check configuration

3. **502 Bad Gateway**
   - Backend container not healthy
   - Check backend logs in CloudWatch
   - Verify target group health checks

---

## Next Steps

1. Choose deployment option (recommended: ECS Fargate)
2. Set up infrastructure (use Terraform/CDK)
3. Configure environment variables
4. Run database migrations
5. Deploy application
6. Set up monitoring and alerts
7. Configure custom domain and SSL

For infrastructure code examples, see the `infrastructure/` directory (to be created).
