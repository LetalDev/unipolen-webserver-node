const fs = require("fs").promises;

async function uploadFile(path, fileStream) {
  var buffers = [];
  fileStream.on('readable', function (buffer) {
    for (; ;) {
      let buffer = fileStream.read();
      if (!buffer) { break; }
      buffers.push(buffer);
    }
  });
  fileStream.on('end', async function() {
    var buffer = Buffer.concat(buffers);

    await fs.writeFile(path, buffer);
  });
}

module.exports = {
  uploadFile,
};