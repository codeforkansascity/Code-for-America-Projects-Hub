/***
Services for fetching data from external REST APIs
***/
cfahubServices.factory('CFAProjectsService', CFAProjectsService);

CFAProjectsService.$inject = ['$http'];

function CFAProjectsService($http) {
  return {
    getProjects: getProjects
  };
  //@TODO CFA API returns paged results in sets of 10.
  function getProjects() {
    return $http.get('http://codeforamerica.org/api/organizations/Code-for-Kansas-City/projects')
      .success(getProjectsComplete)
      .error(serviceError);

    function getProjectsComplete(data, status) {
      return data.objects;
    }
  }
}

cfahubServices.factory('GithubProjectsService', GithubProjectsService);

GithubProjectsService.$inject = ['$http'];

function GithubProjectsService($http) {
  return {
    getProjects: getProjects
  };

  function getProjects() {
    return $http.get('https://api.github.com/orgs/codeforkansascity/repos')
      .success(getProjectsComplete)
      .error(serviceError);

    function getProjectsComplete(data, status) {
      return data;
    }
  }
}

cfahubServices.factory('GoogleProjectsService', GoogleProjectsService);

GoogleProjectsService.$inject = ['$http'];

function GoogleProjectsService($http) {
  return {
    getApprovedProjects: getApprovedProjects,
    getRawApprovedProjects: getRawApprovedProjects
  };

  function getApprovedProjects() {
    return getRawApprovedProjects()
      .then(function(data, status){
        data.data = googleProjectsToSchema().getItems(data);
        return data;
      })
  }

  function getRawApprovedProjects() {
    return $http.get('https://spreadsheets.google.com/feeds/list/1tnW2fTcPEQG93oebrCfvjZw4Vjtn6vkzvqyovxebKlI/1/public/values?alt=json')
      .success(getFeedItems)
      .error(serviceError);
  }
}

cfahubServices.factory('GoogleProjectIdeasService', GoogleProjectIdeasService);

GoogleProjectIdeasService.$inject = ['$http'];

function GoogleProjectIdeasService($http) {
  return {
    getSubmittedIdeas: getSubmittedIdeas
  };

  function getSubmittedIdeas() {
    return $http.get('https://spreadsheets.google.com/feeds/list/1PGM2P9o0bkJ_xCkoH2ps_Dp5xnBDrPxmIB-jnJWAwhE/1/public/values?alt=json')
      .success(getFeedItems)
      .error(serviceError);
  }
}

function getFeedItems(data, status) {
  // Multiple spreadsheet rows in a single Atom <entry>
    return data.feed;
  }

function serviceError(data, status, statusText) {
  return alert(statusText);
}

function googleProjectsToSchema(data) {
  return {
    getSchema: getSchema,
    getItems: getItems
  }

  function getSchema() {
    /** Key-value mapping from Google Spreadsheet fields
     * in the Projects worksheet to fields in the Hub Project cards.
    **/
    return schema = {
      "category": "category",
      "content": "content",
      "gsx$areaofcivicengagementdescribingtheproject": "category",
      "gsx$cityandstate": "city",
      "gsx$civicrequest": "civic",
      "gsx$fulladdress": "full_address",
      "gsx$liveproducturl": "",
      "gsx$location": "location",
      "gsx$maintenanceplan": "maintainence_plan",
      "gsx$non-standardtechnologies": "techstack",
      "gsx$potentialblockers": "potential_blockers",
      "gsx$projectplatform": "platform",
      "gsx$projectsubtitle": "subtitle",
      "gsx$projecttitle": "title",
      "gsx$projecturlongithub": "github_html_url",
      "gsx$street": "",
      "gsx$targetaudience": "target_audience",
      "gsx$timestamp:": "",
      "gsx$userstory": "user_stories",
      "id": "id",
      "link": "link",
      "title": "title",
      "updated": "updated_at"
    };
  }

  function getItems(data) {
    // Entry is an array of row objects.
    entry = data.data.feed.entry;
    var schema = getSchema();
    // For each row, match the field name to the schema.
    angular.forEach(entry, function(row, rowkey) {
      angular.forEach(row, function(field, fieldkey) {
        if(schema[fieldkey]) {
          // Add a new object property with the value from schema as key.
          (entry[rowkey])[schema[fieldkey]] = field['$t'];
        }
      });
    });
    return entry;
  }
}
