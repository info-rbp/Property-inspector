# Contributing to ProInspect Platform

## Development Setup

### Prerequisites
- Node.js 18+ and npm 9+
- Docker and Docker Compose
- Git

### Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR-USERNAME/Property-inspector.git
   cd Property-inspector
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Run setup script:
   ```bash
   ./setup.sh
   ```

5. Start development environment:
   ```bash
   docker-compose up -d postgres redis
   npm run dev
   ```

## Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - Feature development
- `fix/*` - Bug fixes
- `release/*` - Release preparation

### Making Changes

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following our coding standards

3. Write/update tests as needed

4. Commit using conventional commits:
   ```bash
   git commit -m "feat: Add new inspection type"
   git commit -m "fix: Correct photo upload issue"
   git commit -m "docs: Update API documentation"
   ```

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc)
- `refactor:` Code refactoring
- `test:` Test additions or changes
- `chore:` Build process or auxiliary tool changes

### Testing

Run tests before submitting:

```bash
# All tests
npm test

# Specific service
npm test --workspace=packages/gateway

# With coverage
npm run test:coverage
```

### Pull Request Process

1. Update documentation for any API changes
2. Ensure all tests pass
3. Update the README.md with details of changes if needed
4. Request review from maintainers
5. PRs require at least one approval before merging

## Code Standards

### TypeScript
- Use TypeScript for all new code
- Maintain strict type safety
- Avoid `any` types

### Code Style
- Use ESLint and Prettier configurations
- Run `npm run lint` before committing
- Format code with `npm run format`

### File Structure
```
src/
├── routes/       # API route handlers
├── services/     # Business logic
├── middleware/   # Express/Fastify middleware
├── utils/        # Utility functions
├── types/        # TypeScript type definitions
└── __tests__/    # Test files
```

### API Design
- RESTful conventions
- Consistent error responses
- Comprehensive OpenAPI documentation
- Version APIs appropriately

## Database Changes

1. Create migration:
   ```bash
   cd packages/gateway
   npx prisma migrate dev --name your-migration-name
   ```

2. Update schema documentation
3. Test migrations thoroughly

## Service Development

### Adding a New Service

1. Create service directory:
   ```bash
   mkdir services/your-service
   cd services/your-service
   npm init
   ```

2. Follow the established service structure
3. Add to Docker Compose configuration
4. Update gateway integration
5. Document service API

### Service Standards
- Health check endpoint at `/health`
- Readiness probe at `/health/ready`
- Structured logging
- Error handling middleware
- Authentication via service secrets

## Documentation

- Update API documentation for any endpoint changes
- Keep README files current
- Document environment variables
- Include examples for API usage

## Security

- Never commit secrets or credentials
- Use environment variables for configuration
- Validate all inputs
- Implement rate limiting
- Follow OWASP guidelines

## Performance

- Optimize database queries
- Implement caching where appropriate
- Use pagination for list endpoints
- Monitor memory usage
- Profile performance bottlenecks

## Questions?

- Create an issue for bugs or feature requests
- Join discussions in GitHub Discussions
- Contact maintainers for security issues

## License

By contributing, you agree that your contributions will be licensed under the project's license.