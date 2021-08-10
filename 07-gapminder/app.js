const graf = d3.select('#graf')
const anchoTotal = graf.style('width').slice(0, -2)
const altoTotal = (anchoTotal * 9) / 16

let list_countries = [];
const svg = graf
  .append('svg')
  .attr('width', anchoTotal)
  .attr('height', altoTotal)
  .attr('class', 'graf')

const margin = {
  top: 50,
  bottom: 85,
  left: 55,
  right: 30,
}

const ancho = anchoTotal - margin.left - margin.right
const alto = altoTotal - margin.top - margin.bottom

// !ESPACIO DE GRAFICACIÓN
const g = svg
  .append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`)

g.append('rect')
  .attr('x', 0)
  .attr('y', 0)
  .attr('width', ancho)
  .attr('height', alto)
  .attr('stroke', '#333333')
  .attr('fill', '#ffffff77')

const yearDisplay = g
  .append('text')
  .attr('class', 'numerote')
  .attr('x', ancho / 2)
  .attr('y', alto / 2 + 50)
  .attr('text-anchor', 'middle')

// !VARIABLES GLOBALES
let allData = []
var allData2 = []
let year = 0
let minYear, maxYear
let corriendo = false
let intervalo
let country_choosed = "";

// !ELEMENTOS DEL GUI
const txtYear = d3.select('#txt-year')
const btnAtras = d3.select('#btn-atras')
const btnPlay = d3.select('#btn-play')
const btnAdelante = d3.select('#btn-adelante')

//let catalog_countries = d3.select('#catalog_countries')

// !ESCALADORES
let x = d3.scaleLog().range([0, ancho])
let y = d3.scaleLinear().range([alto, 0])
let r = d3.scaleLinear().range([5, 100])
let color = d3
  .scaleOrdinal()
  .range(['#ef476f', '#ffd166', '#06d6a0', '#118ab2', '#073b4c'])

function carga() {
  d3.csv('gapminder.csv').then((datos) => {
    datos.forEach((d) => {
      d.income = +d.income
      d.life_exp = +d.life_exp
      d.population = +d.population
      d.year = +d.year
    })

    datos = d3.filter(
      datos,
      (d) => d.income > 0 && d.life_exp > 0 && d.population > 0
    )
    allData = datos
    filter_countries(allData)
    
    txtYear.attr('value', year)
    minYear = d3.min(datos, (d) => d.year)
    maxYear = d3.max(datos, (d) => d.year)
    year = minYear

    // !DOMINIOS DE LOS ESCALADORES
    x.domain([d3.min(datos, (d) => d.income), d3.max(datos, (d) => d.income)])
    y.domain(d3.extent(d3.map(datos, (d) => d.life_exp)))
    r.domain(d3.extent(d3.map(datos, (d) => d.population)))
    color.domain(d3.map(datos, (d) => d.continet))

    g.append('g')
      .attr('transform', `translate(0, ${alto})`)
      .attr('class', 'ejes')
      .call(
        d3
          .axisBottom(x)
          .ticks(10)
          .tickSize(-alto)
          .tickFormat((d) => d3.format(',d')(d))
      )
      .selectAll('text')
      .attr('transform', 'rotate(-90)')
      .attr('text-anchor', 'end')
      .attr('x', -10)
      .attr('y', -5)

    g.append('g')
      .attr('class', 'ejes')
      .call(d3.axisLeft(y).ticks(10).tickSize(-ancho))

    //cuadro()
    country(country_choosed);
  })

  
}

function dibujo(datos) {
  yearDisplay.text(year)

  burbujas = g.selectAll('circle').data(datos, (d) => d.country)

  burbujas
    .enter()
    .append('circle')
    .attr('cx', (d) => x(d.income))
    .attr('cy', (d) => y(d.life_exp))
    .attr('r', 0)
    .attr('fill-opacity', 0.5)
    .attr('stroke', '#bbb')
    .attr('fill', '#0d0')
    .transition()
    .duration(100)
    .attr('r', 125)
    .transition()
    .duration(100)
    .attr('r', (d) => r(d.population))
    .attr('fill', (d) => color(d.continent))

  burbujas
    .merge(burbujas)
    .transition()
    .duration(200)
    .attr('cx', (d) => x(d.income))
    .attr('cy', (d) => y(d.life_exp))
    .attr('r', (d) => r(d.population))
    .attr('fill', (d) => color(d.continent))

  burbujas
    .exit()
    .transition()
    .duration(100)
    .attr('r', 125)
    .attr('fill', '#d00')
    .transition()
    .duration(100)
    .attr('r', 0)
    .remove()

    titleGroup = g.append('g')
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('x', ancho/2)
        .attr('y', -10)
        .attr('class', 'titulo')
        .text('Life expectancy and income through the years')

}
/*
function cuadro() {
  data = d3.filter(allData, (d) => d.year == year)
  dibujo(data)
}
*/
function country(country_choosed) {
  if(country_choosed != null && country_choosed != ""){
    data = d3.filter(allData, (d) => d.year == year && d.country == country_choosed)
    
  }else{
    data = d3.filter(allData, (d) => d.year == year)
  }
  dibujo(data)
  
}

function changeYear(inc) {
  year += inc

  if (year > maxYear) year = maxYear
  if (year < minYear) year = minYear

  txtYear.attr('value', year)
  //cuadro()
  country(country_choosed);
}

// !EVENT LISTENERS PARA EL GUI
txtYear.on('change', () => {
  year = +txtYear.node().value
  // console.log(year)
  //cuadro()
  country(country_choosed);
});

btnAtras.on('click', () => {
  // year--
  // txtYear.attr('value', year)
  changeYear(-1)
});

btnPlay.on('click', () => {
  corriendo = !corriendo
  if (corriendo) {
    btnPlay.html("<i class='fas fa-pause'></i>")
    btnPlay.classed('btn-danger', true)
    btnPlay.classed('btn-success', false)
    intervalo = d3.interval(() => changeYear(1), 750)
  } else {
    btnPlay.html("<i class='fas fa-play'></i>")
    btnPlay.classed('btn-danger', false)
    btnPlay.classed('btn-success', true)
    intervalo.stop()
  }
});

btnAdelante.on('click', () => {
  changeYear(1)
});


function populate_select(langArray){
var index = 0;
var catalog_countries = document.getElementById("catalog_countries");
for(var i =0; i< langArray.length; i++){
    var option = document.createElement("option");
    option.text = langArray[i];
    catalog_countries.add(option); 
}


}

function filter_countries(allData){
  
  var countries_set = new Set();
  
  for(var i =0 ; i < allData.length; i++){
    var country_tmp = allData[i].country;
      countries_set.add(country_tmp);
  list_countries = Array.from(countries_set);
  list_countries = list_countries.sort();
}
populate_select(list_countries);
}
carga();

function read_select_properties(){
var select_conutries = document.getElementById("catalog_countries");
var index = select_conutries.selectedIndex;
country_choosed = select_conutries.options[index].value;
country(country_choosed);

}