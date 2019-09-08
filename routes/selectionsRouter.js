const Selections=require("../controllers/selections");

module.exports=(app)=>{
    //une séléction
    app.get('/selection/:key', async (req, res) => {
        let selection= await Selections.getSelectionInfos(req.params.key);
        res.render('selection', { title: 'Tango Fury selection - '+ selection.title, selection: selection})
    });

    //toutes les sélections
        app.get('/selections', async (req, res) => {
        let selections= await Selections.getSelections(0);
        res.render('selections-list', { title: "All Tango Fury's selections",selections:selections})
    });
}