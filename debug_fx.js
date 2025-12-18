
import fetch from 'node-fetch';

const ECB_BASE_URL = 'https://data-api.ecb.europa.eu/service';
const ecbCurrency = 'BRL';
const url = `${ECB_BASE_URL}/data/EXR/D.${ecbCurrency}.EUR.SP00.A?lastNObservations=1&format=csvdata`;

async function test() {
    console.log(`Fetching: ${url}`);
    try {
        const response = await fetch(url, { headers: { 'Accept': 'text/csv' } });
        const text = await response.text();
        console.log('--- RAW CSV START ---');
        console.log(text);
        console.log('--- RAW CSV END ---');

        const lines = text.trim().split('\n');
        if (lines.length > 1) {
            const headers = lines[0].split(',');
            const data = lines[lines.length - 1].split(',');

            console.log('\n--- COLUMN MAPPING ---');
            headers.forEach((h, i) => {
                console.log(`Index ${i}: ${h} = ${data[i]}`);
            });
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

test();
