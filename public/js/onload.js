
window.onload = () => {

    getData();

    async function getData(){
        var request = new Request('/api/jola')

        console.log(request)

        await fetch(request).then(async function (response){
            let texto = "";

            var lista = []
            lista = await response.json();
            console.log(lista);

            for(const cerveja of lista){
                texto += `
                <tr class="mx-3">
                  <td >${cerveja.superMercado}</td>
                  <td >${cerveja.marca}</td>
                  <td >${cerveja.tamanho}</td>
                  <td >${cerveja.preçoAtual}€</td>
                  <td >${cerveja.preçoAntigo}€</td>
                  <td >${cerveja.desconto}</td>
                  <td >${cerveja.preçoPorLitro}€/L</td>
                </tr>
                `;
            }
            document.getElementById("table").innerHTML = texto;        
        });
    } 
}

