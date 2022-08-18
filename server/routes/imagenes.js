const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const routes = express.Router();

const diskstorage = multer.diskStorage({

    destination: path.join(__dirname, '../images'),
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname)
    }

});

const fileUpload = multer({
    storage: diskstorage
}).single('image')

routes.post('/imagenes/post', fileUpload, (req, res) => {
    req.getConnection((err, conn) => {
        if (err) return res.status(500).send('server error')
        const tipo_imagen = req.file.mimetype
        const nombre_imagen = req.file.originalname
        const datos_imagen = fs.readFileSync(path.join(__dirname, '../images/' + req.file.filename))

        conn.query('insert into imagenes set ?', [{ tipo_imagen, nombre_imagen, datos_imagen }], (err, rows) => {
            if (err) return res.status(500).send('server error')
            res.send('Éxito al guardar')
        })
    })
})

routes.get('/imagenes/get', (req, res) => {
    req.getConnection((err, conn) => {
        if (err) return res.status(500).send('server error')

        conn.query('select * from imagenes', (err, rows) => {
            if (err) return res.status(500).send('server error')
            rows.map(img => {
                fs.writeFileSync(path.join(__dirname, '../dbimages/' + img.id_imagen + ' galleryApp.png'), img.datos_imagen)
            })
            const imagedir = fs.readdirSync(path.join(__dirname, '../dbimages/'))
            res.json(imagedir)
        })
    })
})

routes.delete('/imagenes/delete/:id', (req, res) => {

    req.getConnection((err, conn) => {
        if (err) return res.status(500).send('server error')

        conn.query('DELETE FROM imagenes WHERE id_imagen = ?', [req.params.id], (err, rows) => {
            if (err) return res.status(500).send('server error')
            fs.unlinkSync(path.join(__dirname, '../dbimages/' + req.params.id + ' galleryApp.png'))

            res.send('Imagen borrada')
        })
    })
})

module.exports = routes;