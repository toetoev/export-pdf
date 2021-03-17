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
	exportPDF(data);
});

const compile = async function(templateName, data){
	const filePath = path.join(process.cwd(), 'views', `${templateName}.html`);
	const html = await fs.readFile(filePath, 'utf-8');
	return handlebars.compile(html)(data);
};

handlebars.registerHelper('dateFormat', function(value, format){
	return moment(value).format(format);
})

async function exportPDF(data){
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

		console.log('done');
		await browser.close();
		//process.exit();
	}
	catch(e){
		console.log(e);
	}
};

app.listen(8080, () => console.log(`Started server at http://localhost:8080!`));
module.exports = router;



