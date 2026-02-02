# Contributing Guide

Thank you for contributing to Parkent Express!

## Getting Started

1. Fork the repository
2. Clone your fork
3. Create a feature branch
4. Make your changes
5. Test your changes
6. Commit with clear messages
7. Push to your fork
8. Open a Pull Request

## Development Setup

See [SETUP.md](SETUP.md) for development environment setup.

## Code Style

### JavaScript/Node.js
- Use ES6+ features
- 2 spaces indentation
- Semicolons required
- Use async/await over promises
- Meaningful variable names

### React/JSX
- Functional components with hooks
- PropTypes for props validation
- Extract reusable components
- Use Tailwind CSS classes

## Commit Messages

Format: `type: description`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Maintenance

Examples:
```
feat: add driver earnings report
fix: resolve order tracking bug
docs: update API documentation
```

## Pull Request Process

1. Update documentation
2. Add tests if applicable
3. Ensure all tests pass
4. Update CHANGELOG.md
5. Request review

## Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd admin-panel
npm test
```

## Questions?

Open an issue or contact maintainers.
