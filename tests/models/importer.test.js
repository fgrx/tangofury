const Importer=require("../../controllers/importer");
const Videos=require("../../controllers/videos");

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

describe("isDeleted",()=>{
    it("should return true", async()=>{
        const deletedVideos=await Videos.getDeletedVideos();
        const result=Importer.isNotDeletedVideo("hQD6HxAuCxc")(deletedVideos)
        expect(result).toBe(false);
    });
})

describe("TestImportVideoFalse",()=>{
    it("should return true",async()=>{
        let added = false;
        let youtubeId="ZaZTTR-FvgYf";
        if(youtubeId){
            // Adding video to the general node
            if(await Importer.isVideoPresentInGeneralNode(youtubeId)===false){
                added =true;
            }
        } 
       
        expect(added).toBe(true);
    })
});




