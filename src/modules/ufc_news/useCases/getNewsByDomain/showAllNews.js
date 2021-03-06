const {
    browserOptions,
    timeoutToRequest,
} = require("../../../../config/puppeteer");
const { AppError } = require("../../../../shared/errors/AppErrors");

class ShowAllNewsUseCase {
    constructor(puppeteer) {
        this.scrapper = puppeteer;
    }
    async execute(pageNumber = 10, title = null, domain = null) {
        const browser = await this.scrapper.launch(browserOptions);
        try {
            const page = await browser.newPage();
            console.log(
                `https://${domain}/pt/category/noticias/page/${pageNumber}/?s=${title}`
            );

            await page.goto(
                `https://${domain}/pt/category/noticias/page/${pageNumber}/${title ? `?s=${title}` : ""
                }`,
                {
                    timeout: timeoutToRequest,
                }
            );

            page.once("load", () => console.log("Página carregada"));

            //Se passar title significa que irá pesquisar apenas por título
            //evaluateHandle => Melhor forma e mais segura de recuperar elementos da DOM
            /*if (title) {
                      //#limit -> botão select de quantidade de dados que irá ser exibido
                      await page.waitForSelector(".ufc") //Formulário com filtros de título 
      
                      await page.evaluate((text) => {
                          document.querySelector("#s").value = text
                          //Chama o evento de submit
                          document.querySelector("#searchform").submit()
                      }, title)
                      //Espera a página recarregar pois ao fazer o submit irá recarregar a página
                      await page.waitForNavigation({ timeout: 5000, waitUntil: ['domcontentloaded'] })
                  }*/

            // await page.waitForSelector(".sector")

            const cards = await page.$eval(".setor section", (section) => {
                let result = [];
                const cards = section.querySelectorAll(".card");

                cards.forEach((card) => {
                    const headerInfo = card.querySelector(".card-header");
                    const headerTitle = headerInfo.querySelector("h1");
                    const url = headerTitle.querySelector("a")?.href;
                    const title = headerTitle.textContent.trim();

                    const date = headerInfo.querySelector(".date").textContent.trim();

                    const publish = headerInfo.querySelector(".publish");
                    const publishLink = publish.querySelector("a")?.href;
                    const publishedFrom = publish.textContent.trim();

                    const content = card
                        .querySelector(".card-content")
                        .textContent.trim();

                    result.push({
                        title,
                        url,
                        date,
                        publishLink,
                        publishedFrom,
                        content,
                    });
                });

                return result;
            });

            await page.close();
            await browser.close();
            return cards;
        } catch (error) {
            await browser.close();
            if (error instanceof this.scrapper.errors.TimeoutError) {
                throw new AppError({
                    message:
                        "[TIMEOUT] - Falha ao buscar notícias por domínio pois o tempo limite de requisição foi alcançado " +
                        error,
                    statusCode: 504,
                });
            }

            throw new AppError({
                message: `Falha ao realizar busca de notícias por domínio. Error -> ${error.message}`,
            });
        }
    }
}

module.exports = {
    ShowAllNewsUseCase,
};
