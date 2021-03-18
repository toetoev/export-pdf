const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const router = express.Router();

const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const handlebars = require('handlebars');
const path = require('path');
const moment = require('moment');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/createPDF', (req, res) => {
	const data = req.body;
	res.send('Received a POST HTTP method');
	exportPDF(data, req, res);
});

app.get('/download/:file(*)', downloadFunc);

const compile = async function(templateName, data){
	const filePath = path.join(process.cwd(), 'views', `${templateName}.html`);
	const html = await fs.readFile(filePath, 'utf-8');
	return handlebars.compile(html)(data);
};

handlebars.registerHelper('dateFormat', function(value, format){
	return moment(value).format(format);
})

async function exportPDF(data, req, res){
	try{
		const browser = await puppeteer.launch();
		const page = await browser.newPage();
		
		const content = await compile('index', data);

		await page.setContent(content);
		await page.evaluate(() => matchMedia('screen').matches);
		await page.pdf({
			path: 'voucher.pdf',
			format: 'A4',
			printBackground: true
		});

		await browser.close();

		let filename = result.filename.split('\\').slice(-1)[0];
		res.status(200).json({
			'status': 'success',
			'message': 'PDF Successfully created',
			'link': process.env.HOST_ADDRESS + '/download/' + filename
		});

	}
	catch(e){
		res.status(500).json({
			'status': 'error',
			'message': 'Failed! Please Try Again!' + e,
		});
	}
};

function downloadFunc (req, res,next) {
	let file = req.params.file;
	let fileLocation = path.join(file);;
	res.download(fileLocation, file);
}

app.listen(8080, () => console.log(`Started server at http://localhost:8080!`));
//module.exports = router;

module.exports.handler = serverless(app);



