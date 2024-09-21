import * as OceanUtils from "../FFT-Ocean 2.0/src/experience/OceanUtils.js" 

const ctx= document.getElementById("myChart")

const JONSWAP= new OceanUtils.JONSWAP(20000,20);

const spectrumData= []
const labels= []
for(let i=0; i<1; i+=0.001)
{
    labels.push(i)
    
    const test = JONSWAP.getJONSWAP(i)
    spectrumData.push(test)
}

const data = {
labels: labels,
  datasets: [{
    label: 'My First Dataset',
    data: spectrumData,
    fill: false,
    borderColor: 'rgb(75, 192, 192)',
    tension: 0.1
  }]
};

const chart = new Chart(ctx, {
    type: 'line',
    data: data
});