import { DataBase } from './DataBase';

const DB = new DataBase(
	'mongodb+srv://Damir:obMoU896KTifFfj4@botdata-sp9px.mongodb.net/prod?retryWrites=true&w=majority',
);

DB.connect(
	{
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true,
	},
	async () => {
		console.log('Connected');
		try {
			const Classes = await DB.getAllSchools();

			for (const Class of Classes) {
				await Class.save();
			}
		} catch (e) {
			console.log(e);
		}
	},
);
