var igv = (function (igv) {

    /**
     * @param url - url to a .bedgraph file
     * @constructor
     */
    igv.BEDGraphFeatureSource = function (url) {
        this.url = url;
    };

    /**
     * Required function fo all data source objects.  Fetches features for the
     * range requested and passes them on to the continuation function.  Usually this is
     * a method that renders the features on the canvas
     *
     * @param chr
     * @param start
     * @param end
     * @param success -- function that takes an array of features as an argument
     */
    igv.BEDGraphFeatureSource.prototype.getFeatures = function (chr, start, end, success) {

        if (this.features) {

            success(this.features[ chr ]);
        } else {

            var myself = this;

            var dataLoader = new igv.DataLoader(this.url);

            dataLoader.loadBinaryString(function (data) {

                var features,
                    lines = data.split("\n");

                myself.features = {};

                lines.forEach(parseLine, myself);

                features = myself.features[ chr ];
                success(features);

            });
        }
    };

    /**
     * Required function for parsing BEDGraph file.  This is the callback
     * method for lines array method lines.forEach(). This method
     * refers to the 'this' pointer of the featureSource.feature
     * property
     *
     * @param line - current line from line array
     * @param index - line array index
     * @param lines - line array
     */
    function parseLine(line, index, lines) {

        var chr,
            parts,
            feature,
            features;

        if (igv.isBlank(line)) {
            return;
        }

        if (igv.isComment(line)) {
            return;
        }

        if(line.startsWith("track")) {
            parseTrackLine(line);
        }

        parts = line.split("\t");

        if (!parts || parts.length < 3) {
            return;
        }

        chr = parts[0];

        features = this.features[ chr ];
        if (!features) {

            features = { featureList:[], minimum:Number.MAX_VALUE, maximum:-Number.MAX_VALUE };
            this.features[ chr ] = features;
        }

        feature = {
            start: parseInt(parts[ 1 ]),
            end: parseInt(parts[ 2 ]),
            value: parseFloat(parts[ 3 ])
        };

        features.featureList.push(feature);
        features.minimum = Math.min(features.minimum, feature.value);
        features.maximum = Math.max(features.maximum, feature.value);

        function parseTrackLine(line) {

            var trackLineArray = line.split(" "),
                trackLine = {},
                moreStuff,
                item;

            item = trackLineArray.shift();
            trackLine.format = item.split("=")[ 1 ];
            if ("bedGraph" !== trackLine.format) {
                return trackLine;
            }


            // bail for now
            return trackLine;



            if (0 === trackLineArray.length) {
                return trackLine;
            }




            trackLine.moreStuff = [];
            trackLineArray.forEach(function (thang, thangs, index) {

                var key = thang.split("=")[ 0 ],
                    val = thang.split("=")[ 1 ];

                trackLine.moreStuff.push({ key: key, value: val});
            });

            return trackLine;
        }


    }

    return igv;

})(igv || {});
