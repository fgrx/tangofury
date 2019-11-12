const Importer=require("../../controllers/importer");


describe("testExistVideoGeneralTrue",()=>{
    it("should return true",async()=>{
        const result =  await Importer.isVideoPresentInGeneralNode("ZaZTTR-FvgY");
        expect(result).toBe(true);
    })
});

describe("testExistVideoGeneralFalse",()=>{
    it("should return false",async()=>{
        const result =  await Importer.isVideoPresentInGeneralNode("fOLQCP_9GUcpopo");
        expect(result).toBe(false);
    })
});

describe("TestImportVideoFalse",()=>{
    it("should return true",async()=>{
        let added = false;
        let youtubeId="ZaZTTR-FvgY";
        if(youtubeId){
            // Adding video to the general node
            console.log("ingestion de la video ?"+youtubeId);
            if(await Importer.isVideoPresentInGeneralNode(youtubeId)===false){
                console.log("video ajoutée dans le général "+youtubeId);
                added =true;
            }else{
                console.log("vidéo déja présente dans le général");
            }
        } 
       
        expect(added).toBe(true);
    })
});




