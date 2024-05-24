const { Firestore } = require('@google-cloud/firestore');

async function getData() {
    const db = new Firestore();

    const predictCollection = db.collection('predictions');

    const snapshot = await predictCollection.get();

    if (snapshot.empty) { return [];}

    const histories = [];
    snapshot.forEach(doc => {
        histories.push({
            id: doc.id,
            history: doc.data()
        });
    });

    return histories;
}

module.exports = getData;