const mongoClient = require('mongodb').MongoClient;

const dbPath = "mongodb://localhost:27017/digitour";

const screenshot = require('./screenshot');


function saveAndMove(db) {
    fetchFromCollection(db, {
        collectionName: 'units', 
        queryArray: [
            { $match: { "type": { $in: ["OPENSPACE_ONLINE", "OPENSPACE_HOUSING_RENTAL"] }, "config.newEngine": { $ne: true }, "status": "LIVE" } },
            { $project: { projectName: 1, unitName: 1 } },
            { $project: { _id: 0, name: "$_id", url: { $concat: ["http://qa-digitour.housing.com/projects/", "$projectName", "/", "$unitName"] } } }
        ]
    })
        .then((projects) => {
            const parallel = 4;
            console.log(projects)
            return screenshot.screenshotUrls(projects, parallel)
        })
        .then(() => {
            console.log("done")
            //Now upload to s3
            process.exit();
        })
        .catch((err) => {
            console.error(err);
            process.exit();
        });
}

function fetchFromCollection(db, data) {
    return new Promise(((resolve, reject) => {
        db.collection(data.collectionName).aggregate(data.queryArray).toArray((err, response) => {
            if (err) {
                console.error("error in aggregate collection", data);
                reject(err);
            } else {
                console.info(response);
                resolve(response);
            }
        });
    }));
}

function connectMongoClient() {
    return new Promise(((resolve, reject) => {
        mongoClient.connect(dbPath, (err, db) => {
            if (err) {
                console.error("Error while connecting to mongo server.", err);
                return reject();
            }
            console.info("Connected correctly to mongo server.");
            let database = db.db('digitour');

            return resolve(database);
        });
    }));
}


// Starter function
connectMongoClient().then(function (resolve) {
    saveAndMove(resolve);
}, function (reject) {
    console.log("Error Connecting to DB. Aborting!!");
    process.exit();
});
