const  awsMethods  = require('../../lib/aws');

module.exports = {
  async uploadImage(req,res){
    try {
      const result = await awsMethods.uploadImage(req.file);
      res.send(result);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error uploading file');
    }
  },

  async viewImage(req,res){
    try {
      const filename = req.params.filename
      console.log(typeof filename);
      
      const url=await awsMethods.viewImage(filename)
      res.status(200).send(url)
    } catch (error) {
      console.log(error);
      res.status(500).send("Error in viewing image")
      
    }
  }
}