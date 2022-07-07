class ShowNewsController{
    constructor(showNewsUseCase){
        this.showNewsUseCase=showNewsUseCase
    }
    async handle(req,res){
        try {
            const {pageNumber,title}=req.query
            const result=await this.showNewsUseCase.execute(pageNumber,title)
            return res.status(200).json(result)
        } catch (error) {
            return res.status(400).json({
                msg:"Falha ao buscar notícia do site da UFC "+error.message
            })
        }
    }
}

module.exports={
    ShowNewsController
}