# DevOps Platform Webhooks Listener

A Node.js server that listens for ALM Octane webhooks and processes them.

## Installation

```bash
npm install
```

## Configuration

The application can be configured using environment variables or command line arguments. Command line arguments take precedence over environment variables.

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=8080                    # Server port (default: 8080)
RESPONSE_CODE=200           # Response status code (default: 200)

# Basic Authentication (Optional)
AUTH_USER=user@domain.com   # Username for basic authentication
AUTH_PASSWORD=secret        # Password for basic authentication

# Octane API Configuration (Required)
OCTANE_USER=username        # Octane API username
OCTANE_PASSWORD=password    # Octane API password

# Logging
VERBOSE=false              # Enable verbose logging (default: false)
```

### Command Line Arguments

```bash
node app [options]

Options:
  --port         Port to use (overrides PORT env variable)
  --rcode        Response status code (overrides RESPONSE_CODE env variable)
  -u             Username for basic authentication (optional, overrides AUTH_USER env variable)
  -p             Password for basic authentication (optional, overrides AUTH_PASSWORD env variable)
  --verbose      Print request headers and body (overrides VERBOSE env variable)
  --help         Print this list and exit
```

Example:
```bash
node app --port=8090 --verbose
```

Example with optional authentication:
```bash
node app --port=8090 --verbose -u user@domain -p secret
```

## Usage

1. Set up your environment variables in `.env` file (at minimum, configure the required Octane credentials)
2. Run the server:
   ```bash
   npm start
   ```
3. The server will start listening for webhooks on the configured port

## Features

- Optional basic authentication support
- Webhook processing for ALM Octane
- Automatic feature updates based on epic changes
- Verbose logging option
- Configurable through environment variables or command line arguments

## License

Apache License 2.0

