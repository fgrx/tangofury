const Importer=require("../../models/importer");

describe("isOkVideo",()=>{
    it("Should return false",async()=>{
        const result = await Importer.isOkVideo("e5LVuMCpzWA",["e5LVuMCpzWA","sfsdfdfds",'odpodsd']);
        expect(result).toBe(false);
    });

    it("Should return true",async()=>{
        const result = await Importer.isOkVideo("e5LVuMCpzWAdf",["e5LVuMCpzWA","sfsdfdfds",'odpodsd']);
        expect(result).toBe(true);
    });
});

describe("addVideo",()=>{
    it("Should ingest",async ()=>{
        
        const video={ title:
            '1',
           youtubeId: 'C0RSJ5-e8aU',
           urlImage: 'https://i.ytimg.com/vi/C0RSJ5-e8aU/hqdefault.jpg',
           type: '',
           valid: true,
           dateAdd: '2019-07-05',
           datePublication: '2019-01-24T14:18:42.000Z',
           description: '',
           importUser: 'bot',
           topVideo: false };

            const result =  await Importer.addVideo(video,"PO25e78zbd");
        const video2={ title:
            '2',
           youtubeId: 'C0RSJ5-e8adU',
           urlImage: 'https://i.ytimg.com/vi/C0RSJ5-e8aU/hqdefault.jpg',
           type: '',
           valid: true,
           dateAdd: '2019-07-05',
           datePublication: '2019-01-24T14:18:42.000Z',
           description: '',
           importUser: 'bot',
           topVideo: false };

           const result2 =  await Importer.addVideo(video2,"PO25e78zbd");

           const video3={ title:
            '3',
           youtubeId: 'C0RSJ5-e8asdfdsdU',
           urlImage: 'https://i.ytimg.com/vi/C0RSJ5-e8aU/hqdefault.jpg',
           type: '',
           valid: true,
           dateAdd: '2019-07-05',
           datePublication: '2019-01-24T14:18:42.000Z',
           description: '',
           importUser: 'bot',
           topVideo: false };

           const result3 =  await Importer.addVideo(video3,"PO25e78zbd");

           expect(result3).toBe(true);
    });
})
