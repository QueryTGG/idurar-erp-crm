const pug = require('pug');
const fs = require('fs');
const moment = require('moment');
// Reemplaza 'html-pdf' con 'puppeteer'
const puppeteer = require('puppeteer');
const { listAllSettings, loadSettings } = require('@/middlewares/settings');
const { getData } = require('@/middlewares/serverData');
const useLanguage = require('@/locale/useLanguage');
const { useMoney, useDate } = require('@/settings');

const pugFiles = ['invoice', 'offer', 'quote', 'payment'];

require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

exports.generatePdf = async (
  modelName,
  info = { filename: 'pdf_file', format: 'A5', orientation: 'portrait', targetLocation: '' },
  result,
  callback
) => {
  try {
    const { targetLocation } = info;

    // Si el PDF ya existe, lo eliminamos para crear uno nuevo
    if (fs.existsSync(targetLocation)) {
      fs.unlinkSync(targetLocation);
    }

    // Renderizar el contenido HTML
    if (pugFiles.includes(modelName.toLowerCase())) {
      // Compilar la plantilla Pug

      const settings = await loadSettings();
      const selectedLang = settings['idurar_app_language'];
      const translate = useLanguage({ selectedLang });

      const {
        currency_symbol,
        currency_position,
        decimal_sep,
        thousand_sep,
        cent_precision,
        zero_format,
      } = settings;

      const { moneyFormatter } = useMoney({
        settings: {
          currency_symbol,
          currency_position,
          decimal_sep,
          thousand_sep,
          cent_precision,
          zero_format,
        },
      });
      const { dateFormat } = useDate({ settings });

      settings.public_server_file = process.env.PUBLIC_SERVER_FILE;

      const htmlContent = pug.renderFile('src/pdf/' + modelName + '.pug', {
        model: result,
        settings,
        translate,
        dateFormat,
        moneyFormatter,
        moment: moment,
      });

      // Generar PDF usando Puppeteer
      const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

      const { format, orientation } = info;
      const isLandscape = orientation === 'landscape';

      await page.pdf({
        path: targetLocation,
        format: format || 'A4',
        landscape: isLandscape,
        printBackground: true,
        margin: {
          top: '10mm',
          right: '10mm',
          bottom: '10mm',
          left: '10mm',
        },
      });

      await browser.close();

      if (callback) callback();
    }
  } catch (error) {
    throw new Error(error);
  }
};