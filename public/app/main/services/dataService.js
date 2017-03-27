angular.module('app')
    .factory("dataService", function($q, $http){

        var getTypeaheadData = function($element, filename) {
            var data = new Bloodhound({
                datumTokenizer: Bloodhound.tokenizers.whitespace,
                queryTokenizer: Bloodhound.tokenizers.whitespace,
                prefetch: {
                    "url": '/data/'+ filename + ".json",
                    cache: false
                }
            });
            return data;
        }

        var initPrefetchTypeahead = function() {
            $('.prefetch .typeahead').each(function () {
                var $this = $(this);
                var filename = $this.data("file-name");
                var data  = getTypeaheadData($this, filename);
                $this.typeahead(null, {
                    name: filename,
                    source: data
                });
            })
        }

        var initSchoolTypeahead = function() {
            var $element = $('#school');
            var filename = $element.data("file-name");
            var data = new Bloodhound({
                datumTokenizer: function (datum) {
                    return Bloodhound.tokenizers.whitespace(datum.name);
                },
                queryTokenizer: Bloodhound.tokenizers.whitespace,
                remote: {
                    url: "http://localhost:7700/data/schools",
                    filter: function (data) {
                        // Map the remote source JSON array to a JavaScript object array
                        return $.map(data, function (school) {
                            return {
                                name: school.name,
                                country: school.country
                            };
                        });
                    }
                },
            });
            data.initialize();
            $element.typeahead(null, {
                displayKey: 'name',
                source: data.ttAdapter(),
                templates: {
                    suggestion: Handlebars.compile("<div class='tt-suggestion tt-selectable'><div>{{name}}</div><div class='clr-gray-light'>{{country}}</div></div>")
                }
            }).on('typeahead:selected', function (obj, selected, name) {
                $('#school-country').val(selected.country);
                console.log(selected);
            })
        }

        var initTagsTypeahead = function() {
            $('.tags-input-container .tags-typeahead').each(function () {
                $this = $(this);
                var filename = $this.data("file-name");
                var data = new Bloodhound({
                    datumTokenizer: Bloodhound.tokenizers.whitespace,
                    queryTokenizer: Bloodhound.tokenizers.whitespace,
                    prefetch: '/data/'+ filename + ".json"
                });

                $this.typeahead(null, {
                    name: filename,
                    source: data
                });
            })
        }

        var getRoles = function () {
            var deferred = $q.defer();
            $http.get('/data/roles').then(function(response) {
                deferred.resolve(response.data);
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        }

        return {
            getRoles: getRoles,
            initTagsTypeahead: initTagsTypeahead,
            initPrefetchTypeahead: initPrefetchTypeahead,
            initSchoolTypeahead: initSchoolTypeahead
        }
    });

