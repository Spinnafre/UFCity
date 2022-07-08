const { browserOptions, timeoutToRequest } = require('../../../config/puppeteer');


class ShowRUMenuByDayUseCase {
    constructor(puppeteer){
        this.scrapper=puppeteer
    }
    async execute(day) {
        
        try {
            const browser = await this.scrapper.launch(browserOptions);
            const page = await browser.newPage();
            await page.goto(`https://www.ufc.br/restaurante/cardapio/1-restaurante-universitario-de-fortaleza/${day}`,{
                timeout:timeoutToRequest
            });

            const typesOfMeat=await page.evaluate(()=>{
                const types= document.querySelector(".c-cardapios")
                const tagTitles=Array.from(types.getElementsByTagName("h3"))
    
                const titlesIDs=tagTitles.map(title=>{
                    return title.getAttribute("id")
                })
                
                return titlesIDs
            })
    
            const result=[]
            if(typesOfMeat.length){
                for(let type of typesOfMeat){
                    //.refeicao.desjejum > .listras
                    const selector=`.refeicao.${type} > .listras`
                    const meat=await page.$eval(selector,(table)=>{
                        function removeBlanksLines(text) {
                            const allLines = text.split("\n");
                            return allLines.join(", ")
                        }

                        let result=[]
    
                        let rows=Array.from(table.getElementsByTagName("tr"))
    
                        for(let row of rows){
                            let title=row.firstElementChild.textContent.trim()
                            let options=removeBlanksLines(row.lastElementChild.innerText.trim())
                            result.push({
                                title,
                                options
                            })
                        }
                        return result
                    })
                    result.push({
                        type,
                        meat
                    })
                }
     
                await browser.close()
                return result
            }else{
                //Não tem refeição no DIA
                console.log('SEM REFEIÇÃO NO DIA MAN!')
                await browser.close()
                return []
            }
            
            
        } catch (error) {
            await browser.close()
            return new Error('Falha ao buscar informações do site do RU da UFC ',error.message)
        }
    }
}

module.exports = {
    ShowRUMenuByDayUseCase
}

