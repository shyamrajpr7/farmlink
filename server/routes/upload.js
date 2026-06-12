const express = require('express')
const router = express.Router()
const { upload, cloudinary } = require('../config/cloudinary')
const { protect, authorise } = require('../middleware/auth')

// POST /api/upload/product — upload single product image
router.post('/product', protect, authorise('farmer'), upload.single('image'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image provided.' })
    res.json({
      message: 'Image uploaded successfully.',
      url: req.file.path,
      publicId: req.file.filename,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// DELETE /api/upload/product/:publicId — delete image from Cloudinary
router.delete('/product/:publicId', protect, authorise('farmer'), async (req, res) => {
  try {
    await cloudinary.uploader.destroy(req.params.publicId)
    res.json({ message: 'Image deleted.' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router