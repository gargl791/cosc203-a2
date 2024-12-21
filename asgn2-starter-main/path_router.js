const express = require('express');
const pool = require('./db');
router = express.Router();

//sharing global variable bird_id between edit middlewares
let edit_bird_id = "";


router.get('/', async (req, res) => {
    res.redirect('/birds')
});


router.get('/birds', async (req, res) => {
    conservation_status_data = []

    /* conservation status from mysql */
    const db = pool.promise();
    const status_query = `SELECT * FROM ConservationStatus;`
    try {
        const [rows, fields] = await db.query(status_query);
        conservation_status_data = rows;
    } catch (err) {
        console.error("You havent set up the database yet!");
    }

    /* REPLACE THE .json WITH A MYSQL DATABASE */
    //const birds = require('./sql/nzbird.json');

    birds = []
    const bird_query = `SELECT * FROM Bird
    join Photos on Bird.bird_id = Photos.bird_id
    join ConservationStatus on Bird.status_id = ConservationStatus.status_id;`
    try {
        const [rows, fields] = await db.query(bird_query);
        birds = rows;
    } catch (err) {
        console.error("You havent set up the database yet!");
    }


    res.render('index', { title: 'Birds of Aotearoa', birds: birds, status: conservation_status_data });
});


router.get('/birds/create', async (req, res) => {

    res.render('create_bird', { title: 'Birds of Aotearoa', birds: birds, status: conservation_status_data });
});


router.get("/birds/:id/delete", async (req, res) => {

    const bird_id = req.params.id;
    const db = pool.promise();
    let stmt = "DELETE FROM Photos WHERE bird_id = ?;"
    const [rows, fields] = await db.query(stmt, [
        bird_id
    ]);
    stmt = "delete from Bird where bird_id = ?;"
    const [bird_rows, bird_fields] = await db.query(stmt, [
        bird_id
    ]);
    res.header('Access-Control-Allow-Origin', '*');
    res.status(204);
    res.redirect("/birds")
});

router.get('/birds/:id', async (req, res) => {
    conservation_status_data = []

    /* conservation status from mysql */
    const db = pool.promise();
    const status_query = `SELECT * FROM ConservationStatus;`
    try {
        const [rows, fields] = await db.query(status_query);
        conservation_status_data = rows;
    } catch (err) {
        console.error("You havent set up the database yet!");
    }


    const bird_id = req.params.id;

    const bird_query = `SELECT * FROM Bird
    join Photos on Bird.bird_id = Photos.bird_id
    join ConservationStatus on Bird.status_id = ConservationStatus.status_id where Bird.bird_id = ?;`
    try {
        const [rows, fields] = await db.query(bird_query, [
            bird_id
        ]);
        birds = rows;

        res.render('index', { title: 'Birds of Aotearoa', birds: birds, status: conservation_status_data });
    }
    catch (err) {
        console.error("Error in viewing single bird: " + err);
    }
});


router.get("/birds/:id/edit", async (req, res) => {

    conservation_status_data = []

    /* conservation status from mysql */
    const db = pool.promise();
    const status_query = `SELECT * FROM ConservationStatus;`
    try {
        const [rows, fields] = await db.query(status_query);
        conservation_status_data = rows;
    } catch (err) {
        console.error("You havent set up the database yet!");
    }

    let bird_id = "";
    bird_id = req.params.id;
    
    const bird_query = `SELECT * FROM Bird
    join Photos on Bird.bird_id = Photos.bird_id where Bird.bird_id = ?;`
    try {
        const [rows, fields] = await db.query(bird_query, [bird_id]);
        bird = rows[0];
        console.log(bird)
        res.render('edit_bird', { title: 'Birds of Aotearoa', curr_bird: bird, status: conservation_status_data });
    } catch (err) {
        console.error("Error in updating bird (GET): " + err);
    }
});



router.post("/birds/edit", async (req, res) => {

    
    try {
        const {
            primary_name,
            english_name,
            scientific_name,
            order_name,
            family,
            length,
            weight,
            status_name,
            bird_id

        } = req.body;
        console.log(req.body)
        
        //console.log(bird_id + "POST");

        const db = pool.promise();
        const stmt = "UPDATE Bird SET primary_name = ?, english_name = ?, scientific_name = ?, order_name = ?, family = ?, length = ?, weight = ?, status_id = ? WHERE bird_id = ?;"
        const [rows, fields] = await db.query(stmt, [
            primary_name,
            english_name,
            scientific_name,
            order_name,
            family,
            length,
            weight,
            status_name,
            bird_id
        ]);


        //this checks if photo was not uploaded, dont update photo else update photo
        const {
            filename,
            photographer

        } = req.body

        const photo_query = `SELECT * FROM Photos where bird_id = ?;`;
        const [photo_rows, photo_fields] = await db.query(photo_query, [
            filename,
            photographer,
            bird_id
        ]);

        //checks request.file exists or if photo_upload from html exists
        if(req.files == null || req.files.photo_upload == null){


        }
        else {
        const photo_upload = req.files.photo_upload;
        const filename = photo_upload.name;
        
        photo_upload.mv('./public/images/' + filename);
        // console.log(bird_id)
        const {
            photographer

        } = req.body;
    
        const photo_stmt = "UPDATE Photos SET filename = ?, photographer = ?, bird_id = ? WHERE bird_id = ?;"
       
        const [rows_pt, fields_pt] = await db.query(photo_stmt, [
            filename,
            photographer,
            bird_id,
            bird_id
        ]);
        }


        res.header('Access-Control-Allow-Origin', '*');
        res.header('Content-Type', 'application/json');

        res.status(200);
        res.redirect("/birds")
    } catch (err) {
        console.error("Error in updating bird details (POST): " + err);
    }

});



router.post('/birds/create', async (req, res) => {
    console.log(req.body);
    try {
        const {
            primary_name,
            english_name,
            scientific_name,
            order_name,
            family,
            length,
            weight,
            status_name

        } = req.body;

        const db = pool.promise();
        const stmt = "INSERT INTO Bird (primary_name, english_name, scientific_name, order_name, family, length, weight, status_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?);"
        const [rows, fields] = await db.query(stmt, [
            primary_name,
            english_name,
            scientific_name,
            order_name,
            family,
            length,
            weight,
            status_name
        ]);


        const [rows_b, fields_b] = await db.query("SELECT LAST_INSERT_ID() as bird_id;");
        const bird_id = rows_b[0].bird_id;
        console.log(bird_id)

        const photo_upload = req.files.photo_upload;
        const filename = photo_upload.name;

        photo_upload.mv('./public/images/' + filename);
        // console.log(bird_id)
        const {
            photographer

        } = req.body;

        const photo_stmt = "INSERT INTO Photos (filename, photographer, bird_id) VALUES (?, ?, ?);"
        const [rows_pt, fields_pt] = await db.query(photo_stmt, [
            filename,
            photographer,
            bird_id
        ]);


        res.header('Access-Control-Allow-Origin', '*');
        res.header('Content-Type', 'application/json');

        res.status(200);
        res.redirect("/birds")
    } catch (err) {
        console.error("Error in creating bird: " + err);
    }
});


router.get("*", async (req, res) => {

    res.status(404);
    res.render("birds_404", {title: "Birds of Aotearoa", status: conservation_status_data});
});








module.exports = router;