var MongoClient = require('mongodb').MongoClient;
	 MongoClient.connect(`mongodb+srv://sankalp:sankalp27@cluster0.eqbpw.mongodb.net`)
		.then(async function(client){
			let db = client.db('asterisk')
			// const { PSAors } = require('../api/models');
			let ps_aors = await db.collection('ps_aors').find({}).toArray();
      ps_aors.forEach(async (psaor) => {
         await db.collection('ps_aors').findOneAndUpdate({_id: psaor._id}, {$set:{max_contacts:1,minimum_expiration:60,maximum_expiration:60,remove_existing:'yes'}})
      })
      console.log(ps_aors);
				 // change_streams.on('change', async function(change){
					//  const extension = change.documentKey._id.split(';')[0];
					//  const user = await PSAors.find({});
					//  console.log(change.operationType, " ", extension );
					//  if(change.operationType === 'delete'){
					// 	 user.status = 'offline';
					//  }else {
					// 	 user.status = 'online';
					//  }
					//  await user.save();
				 // });
		 });
