{
  "version": 2,
  "name": "tango-fury",
  "routes": [
    { "src": "/", "dest": "index.js" },
    { "src": "*.js", "use": "@now/node" }
  ]
}