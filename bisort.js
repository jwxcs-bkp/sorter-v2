function PrefList(n, limit) {
    this.size = n;
    this.limit = limit;
    this.items = [{item: 0, equals: []}];
    this.current = {item: 1, try: 0, min: 0, max: 1};

    this.addAnswer = function(x, y, pref) {
        if (pref == 0) {
            this.items[this.current.try].equals.push(this.current.item);
            this.current = {item: ++this.current.item, try: 0, min: 0, max: this.items.length};
        } else {
            if (pref == -1) this.current.max = this.current.try
            else this.current.min = this.current.try + 1;

            if (this.current.min == this.current.max) {
                this.items.splice(this.current.min, 0, {item: this.current.item, equals: []});
                this.current = {item: ++this.current.item, try: 0, min: 0, max: this.items.length};
            } else if (this.current.min >= this.limit) {
                if (this.items[this.limit]) this.items[this.limit].equals.push(this.current.item);
                else this.items.splice(this.limit, 0, {item: this.current.item, equals: []});
                this.current = {item: ++this.current.item, try: 0, min: 0, max: this.items.length};
            }
        }
    }

    this.getQuestion = function() {
        if (this.current.item >= this.size) return null;
        this.current.try = Math.min(this.limit-1, Math.floor((this.current.min + this.current.max) / 2));

        return({a: this.current.item, b: this.items[this.current.try].item, pos: this.current.try+1});
    }

    this.getOrder = function() {
        var index = [];
        for (var i in this.items) {
            var equal = [this.items[i].item];
            for (var j in this.items[i].equals) {
                equal.push(this.items[i].equals[j]);
            }
            index.push(equal);
        }
        return(index);
    }

    this.getLimit = function() {
        return this.limit;
    }

    this.getSorted = function() {
        var totalSorted = 0;
        for (var i = 0; i < this.items.length; i++) {
            totalSorted += this.items[i].equals.length + 1;
        }
        return totalSorted;
    }
}

var t, c = 0, q = null;
var dataset = [1,2];

function choose(choiceCategory, limit) {
    _getDataset(choiceCategory, limit);
}

function _getDataset(choiceCategory, limit) {

    if (window.XMLHttpRequest) {
      // code for IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp = new XMLHttpRequest();
    } else {
      // code for IE6, IE5
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        dataset = (this.responseText||"").split("#");
        start(limit);
      }
    };
    xmlhttp.open("GET","./data-set-" + choiceCategory + ".php", true);
    xmlhttp.send();
    $("#loading").removeClass("no-display");
}


function start(limit) {
    shuffle(dataset);
    var len = dataset.length;
    limit = limit || len;
    t = new PrefList(len, limit);

    $("#loading").addClass("no-display");
    $("#info").addClass("no-display");
    $("#comparison").removeClass("no-display");
    $("#update").removeClass("no-display");
    $("#results").addClass("no-display");

    processQuestion();
}

function processQuestion() {
    q = t.getQuestion();
    if (q != null) {
        displayQuestion(q);
    } else {
        updateResults(true);
    }
}

function displayQuestion(q) {
    $("#qn").text(++c);
    aVal = dataset[q.a].split(": ");
    bVal = dataset[q.b].split(": ");

    aHtml = "<br />";
    bHtml = "";

    if (c > 1) bHtml += "<small>currently at #" + q.pos + "</small><br />";

    aHtml += aVal[0];
    bHtml += bVal[0];

    if (aVal.length > 1) {
       aHtml += "<br /><small>" + aVal[1] + "</small>";
    }

    if (bVal.length > 1) {
       bHtml += "<br /><small>" + bVal[1] + "</small>";
    }

    $("#left").html(aHtml);
    $("#right").html(bHtml)

}

function chooseLeft() {
    processAnswer(-1);
}
function chooseRight() {
    processAnswer(1);
}

function noChoice() {
    processAnswer(0);
}

function tie() {
    processAnswer(0);
}

function processAnswer(answer) {
    t.addAnswer(q.a, q.b, answer);
    updateResults(false);
    processQuestion();
}

function updateResults(isFinal) {
    var index = t.getOrder();
    var limit = Math.min(t.getLimit(), index.length);
    var html = "<table class='update-tbl'>";

    for (var i = 0; i < limit; i++) {
        var len = index[i].length;

        var rClass = i%2 == 0 ? "row-even" : "row-odd";
        html += "<tr class = '" + rClass + "'>";
        html += "<td class='rank'>";
        html += (i+1) + "</td>";

        for (var j = 0; j < len; j++) {
            if (len > 1) {
                if (j == 0) {
                    html += "<td class='rank-data'>(" + len + "-way tie)</td>";
                    html += "</tr>"; // close row and open new one
                }

                html += "<tr class = '" + rClass + "'>";
                html += "<td>&nbsp;</td>"
            }

            html += "<td class='rank-data'>" + dataset[index[i][j]] + "</td>";
            html += "</tr>"; // close row
            
        }
    }
    html += "</table>";

    var descriptor = "Current";
    var details = "<h3>Sorted " + t.getSorted() + " of " + dataset.length + " items.</h3>";

    if (isFinal) { 
        descriptor = "Final"
        details = "<h3>It took you " + c + " questions to sort your top " + limit + " from " + dataset.length + " items.</h3>";
        details += "<button onclick='location.reload()' type='button'>Back to Main Page</button>";
        $("#comparison").addClass("no-display");
    }
    $("#update").html("<h2>" + descriptor + " Ranking</h2>" + html + details);
}

function debugResults() {
    var index = t.getOrder();
    for (var i = 0, pos = 1; i < index.length; i++) {
        var len = index[i].length;
        var pre = pos + ". " + (len > 1 ? "(" + len + "-way tie)" : "");
        for (var j = 0; j < len; j++) {
            pre = "&nbsp;&nbsp;&nbsp;&nbsp;";
        }
        pos ++;
    }
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
}