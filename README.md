# FeatureTable
Example Widget to test Feature Table in CMV

Used ESRI Example https://developers.arcgis.com/javascript/3/jssamples/featuretable_formatting.html
This is just example widget to test the functionlity of ESRI Feature Table in CMV.

CMV Config Settings

            featureTable: {
                include: true,
                id: 'featureTable',
                type: 'titlePane', //titlePane, invisible
                canFloat: true,
                title: 'Feature Table',
                path: 'widgets/FeatureTable',
                position: 35,
                open: false,
                options: {
                    map: true,
                }
            },                      

Put the wiget code to folder \widgets

This widget utilizes @tmcgee attributesTabContainer as the place holder, then applies dojo topic to add/remove the Feature Table tab to the attributesTabContainer.

Have to add this line to format the dgrid in te feature table, othewise it will not use entire pane width
            
            domStyle.set("myTableNode_grid", "width", "100%");
            

![alt tag](/FeatureTable.png)


