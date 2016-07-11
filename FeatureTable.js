define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',   
    'dojo/text!./FeatureTable/templates/FeatureTable.html',

    'esri/layers/FeatureLayer',
    'esri/dijit/FeatureTable',
    'esri/geometry/Extent',
    'esri/symbols/SimpleMarkerSymbol',
    'esri/symbols/SimpleLineSymbol',

    'esri/Color',
    'dojo/dom',
    'dojo/on',
    'dojo/query',
    'dojo/domReady!',
    'dojo/dom-style',
    'dojo/topic',
    'dojo/aspect',
    'dojo/_base/lang',
    'dijit/registry',
    'dijit/form/Button',
    'dijit/layout/BorderContainer',
    'dijit/form/TextBox',
    'dojo/dom-construct',
    'dijit/layout/ContentPane',
    'xstyle/css!./FeatureTable/css/Draw.css'
], function (
    declare,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    template,

    FeatureLayer, FeatureTable, Extent, SimpleMarkerSymbol, SimpleLineSymbol,

    Color,
    dom,
    on, query, domReady, domStyle, topic, aspect, lang, registry, Button, BorderContainer, TextBox, domConstruct, ContentPane
) {

    var flag;
    var map; 
    var myFeatureTable;
    var myFeatureLayer;
    var pane;
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

        widgetsInTemplate: true,
        templateString: template,
        map: true,

        postCreate: function () {
            this.inherited(arguments);
            map = this.map;

            if (this.parentWidget) {
                if (this.parentWidget.toggleable) {
                    this.own(aspect.after(this.parentWidget, 'toggle', lang.hitch(this, function () {
                        this.onLayoutChange(this.parentWidget.open);
                    })));
                }
            } 
        },

        loadTable: function () {

            console.log(query(".attributesTabContainer"));

            if (!pane)
            {
                pane = new ContentPane({ title: "Feature Table", content: '<div id="myTableNode"></div>' });            
            }

            var tabsid = query(".attributesTabContainer")[0].id;
            var tabs = registry.byId(tabsid);

            tabs.addChild(pane);
            tabs.selectChild(pane);    

            //open the bottom pane
            topic.publish('viewer/togglePane', {
                pane: 'bottom',
                show: 'block'
            });   

            if (!myFeatureLayer)
            {
                myFeatureLayer = new FeatureLayer("https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/New_Real_Estate/FeatureServer/0",{
                    mode: FeatureLayer.MODE_ONDEMAND,
                    outFields: ["*"],
                    visible: true,
                    id: "fLayer"
                });                
            }

            //set a selection symbol for the featurelayer.
            var selectionSymbol =  new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_SQUARE, 12, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0, 255, 197, 1])));
            myFeatureLayer.setSelectionSymbol(selectionSymbol);
     
            if (!this.map.getLayer("fLayer"))
                this.map.addLayer(myFeatureLayer);

              //create new FeatureTable and set its properties 
            if (!myFeatureTable)
            {
                myFeatureTable = new FeatureTable({
                    featureLayer : myFeatureLayer,
                    map : this.map,
                    showAttachments: true,
                    gridOptions: {
                        allowSelectAll: true,
                        allowTextSelection: true,
                    },
                    editable: true,
                    dateOptions: {
                        //set date options at the feature table level 
                        //all date fields will adhere this 
                        datePattern: "MMMM d, y"
                    },
                    //define order and visibility of fields. If the fields are not listed in 'outFIelds'
                    // then they will be hidden when the table starts. 
                    outFields: ["Address", "Created_Date", "Use_Type", "Building_Size_Sqft",  "Status", "Parking_Count", "Primary_Parking_Type", "Tenancy", "Floors"],
            //        outFields: ["*"],

                    fieldInfos: [
                        {
                            name: 'Building_Size_Sqft', 
                            alias: 'Building Size', 
                            format: {
                              template: "${value} sqft"
                            }
                        },
                        {
                            name: 'Available_Size_Sqft', 
                            alias: 'Available Size',
                            format: {
                              template: "${value} sqft"
                            }
                        }
                    ],
                }, 'myTableNode');

                myFeatureTable.startup();

                //need to resize the tab
                this.resizeGrid();
            }
            else
                myFeatureTable.startup();
        },

        resizeGrid: function()
        {
            domStyle.set("myTableNode_grid", "width", "100%");
        },

        onFeatureTable: function()
        {
            this.disconnectMapClick();
            this.loadTable();
        },

        onClearFeatureTable: function()
        {
            this.map.graphics.clear();
            this.map.removeLayer(myFeatureLayer);
            myFeatureTable.destroy();
            myFeatureTable = null;
            this.connectMapClick();
     
            if (pane)
            {
                var tabsid = query(".attributesTabContainer")[0].id;
                var tabs = registry.byId(tabsid);
                tabs.removeChild(pane);
                pane = null;
            }            

            //close the bottom pane
            topic.publish('viewer/togglePane', {
                pane: 'bottom',
                show: 'none'
            });               
        },

        onLayoutChange: function (open) {
            if (open) {
                //this.disconnectMapClick();            
            } else {
                this.onClear();
            }
        },

        disconnectMapClick: function() {
            topic.publish("mapClickMode/setCurrent", "draw");
        },

        connectMapClick: function() {
            topic.publish("mapClickMode/setDefault");
        },

        setMapClickMode: function (mode) {
            this.mapClickMode = mode;
        }
    })

});