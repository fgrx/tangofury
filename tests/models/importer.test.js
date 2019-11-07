const Importer=require("../../controllers/importer");


describe("isokfunc",()=>{
    it("should return false",async()=>{
        const result = Importer.isokfunc();
        expect(result).toBe(true);
    })
});

describe("testExistVideoGeneralTrue",()=>{
    it("should return true",async()=>{
        const result =  await Importer.isVideoPresentInGeneralNode("fOLQCP_9GUc");
        expect(result).toBe(true);
    })
});

describe("testExistVideoGeneralFalse",()=>{
    it("should return false",async()=>{
        const result =  await Importer.isVideoPresentInGeneralNode("fOLQCP_9GUcpopo");
        expect(result).toBe(false);
    })
});

