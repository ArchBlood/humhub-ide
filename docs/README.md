# HumHub IDE

An integrated development environment specifically designed for HumHub module development.

## Features

- **Module Development Tools**: Streamlined creation and management of HumHub modules
- **Code Snippets**: Pre-built templates for common HumHub components (Module, Widget, Activity, Controller, Stream)
- **Code Generation**: Wizards for common HumHub patterns and boilerplate
- **Database Management**: Tools for working with HumHub's database schema

## Installation

### Download

Download the latest release for your platform:
- [Windows](https://github.com/yourusername/humhub-ide/releases/latest)
- [macOS](https://github.com/yourusername/humhub-ide/releases/latest)
- [Linux](https://github.com/yourusername/humhub-ide/releases/latest)

### From Source

```bash
# Clone the repository
git clone https://github.com/yourusername/humhub-ide.git

# Navigate to the project directory
cd humhub-ide

# Install dependencies
npm install

# Start the application
npm start
```

## Getting Started

1. **Create a new project**: File → New Project → HumHub Module
2. **Open existing project**: Open a directory containing a HumHub module
3. **Configure HumHub instance**: Set up connection to your development HumHub instance

## Code Snippets

The IDE includes ready-to-use code snippets for HumHub module development:

- `humhub-module`: Base module class template
- `humhub-widget`: Widget class template
- `humhub-activity`: Activity class template
- `humhub-controller`: Controller class template
- `humhub-stream`: Stream action class template

## Project Structure

The IDE automatically recognizes and provides specialized tools for standard HumHub file structures:

- `config.php` - Module configuration
- `Module.php` - Module main class
- `controllers/` - Controller classes
- `models/` - Database models
- `views/` - View files
- `resources/` - JavaScript, CSS, and other assets
- `migrations/` - Database migrations

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the GPL-3.0-only License - see the LICENSE file for details.

## Status

This project is currently in active development. Features and interface may change significantly between versions.

**Note:** Theme development tools are planned for future releases but are not currently supported.
