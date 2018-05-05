
var catalog = document.getElementById("catalog");
var client;
var commandsTable = document.getElementById("commands");
var commandsColumns = ["Name", "Endpoint", "RequestType", "Arg1", "Arg2", "Arg3", "Arg4", "Arg5", "Arg6" ]
var connect = document.getElementById("connect");
var ipAddress = document.getElementById("ip-address");
var scripts = [];

connect.onclick = function() {
  ip = validateIPAddress(ipAddress.value);
  if (!ip) {
    console.log("Error: IP address needed.");
    return;
  }
  client = new LightClient(ip, 10000);
  getCommands();
};

function getCommands () {
	var implementedCommands;
	var betaCommands;
	var alphaCommands;
  client.GetCommand("info/help", function(data) {
    implementedCommands = JSON.parse(data[0].result);
    client.GetCommand("beta/info/help", function(data) {
      betaCommands = JSON.parse(data[0].result);
      client.GetCommand("alpha/info/help", function(data) {
        alphaCommands = JSON.parse(data[0].result);
        createAllCommands(implementedCommands, betaCommands, alphaCommands);
      });
    });
  });
}

function createAllCommands(implementedCommands, betaCommands, alphaCommands) {
	let commands = [];
	let array = [
		{ commands: implementedCommands, releaseType: "Release" },
		{ commands: betaCommands, releaseType: "Beta" },
		{ commands: alphaCommands, releaseType: "Alpha" }
	];

	for (var x = 0; x < array.length; x++) {
		constructCommandObjects(array[x].commands, array[x].releaseType, handleResult);
	}

	constructCommandObjects(implementedCommands, "Release", handleResult);

	function handleResult(commandObjects) {
		for (object = 0; object < commandObjects.length; object++) {
			commands.push(commandObjects[object]);
		}
	}

	commands.forEach(function (object) {
		if (object.ReleaseType === "Beta") {
			object.Category = "Beta";
			object.Endpoint = "beta/" + object.Endpoint;
		} else if (object.ReleaseType === "Alpha") {
			object.Category = "Alpha";
			object.Endpoint = "alpha/" + object.Endpoint;
		}
	});

	commands.push({ "Category": "Locomotion", "Name": "DriveTimeAngular", "Arguments": null, "ReleaseType": "Release" });
	commands.push({ "Category": "General", "Name": "PauseCode", "Arguments": null, "ReleaseType": "Release" });
	populateTableHeaders(commandsTable, commandsColumns, commands);
}

//Create command objects with the details needed to create blockly blocks
function constructCommandObjects(commands, releaseType, callback) {
	var commandObjects = [];
	let postCommands = commands.post;
	let getCommands = commands.get;
	for (var x = 0; x < postCommands.length; x++) {
		let thisCommand = postCommands[x];
		let commandObject = {
			"Category": thisCommand.apiCommand.apiCommandGroup,
			"Name": thisCommand.apiCommand.id,
			"Endpoint": thisCommand.endpoint,
			"Arguments": thisCommand.apiCommand.arguments,
			"ReleaseType": releaseType,
			"RequestType": "POST"
    }
		commandObjects.push(commandObject);
	}
	for (var z = 0; z < getCommands.length; z++) {
		let thisCommand = getCommands[z];
		let commandObject = {
			"Category": thisCommand.apiCommand.apiCommandGroup,
			"Name": thisCommand.apiCommand.id,
			"Endpoint": thisCommand.endpoint,
			"Arguments": thisCommand.apiCommand.arguments,
			"ReleaseType": releaseType,
			"RequestType": "GET"
		};
		commandObjects.push(commandObject);
	}
	parseArguments(commandObjects, callback);
}

function parseArguments(commandObjects, callback) {
	commandObjects.forEach(function (command) {
		if (command.Arguments) {
			var commandArguments = command.Arguments;
			var argNames = Object.keys(commandArguments);
			var argArray = Array.from(argNames, x => commandArguments[x]);
			var args = []
			argArray.forEach(function (arg) {
				let type = arg["getValueType"].substring(7, arg["getValueType"].indexOf(","));
				let argument = {
					"Name": arg.name,
					"Type": type,
					"Value": arg.Value
				};
				args.push(argument);
			});
			command.Arguments = args;
		}
	});
	callback(commandObjects);
}

function populateTableHeaders (table, columns, data) {
  $(table).empty();
  var tableHeader = $("<tr>");
  columns.forEach(function(col) {
    var column = $("<th>").text(col);
    tableHeader.append(column);
  });
  $(table).append(tableHeader);

  populateTable(table, columns, data);
}

function populateTable (table, columns, data) {
  for(i = 0; i < data.length; i++) {
    var command = data[i];
    var row = $("<tr>");
    var name = $("<td>").text(command.Name);
    var endpoint = $("<td>").text(command.Endpoint);
    var requestType = $("<td>").text(command.RequestType);
    var arg1 = $("<td>").text("");
    var arg2 = $("<td>").text("");
    var arg3 = $("<td>").text("");
    var arg4 = $("<td>").text("");
    var arg5 = $("<td>").text("");
    var arg6 = $("<td>").text("");
    var args = [arg1, arg2, arg3, arg4, arg5, arg6];
    var arguments = command.Arguments;
    
    if (arguments && arguments.length > 0) {
      for (j = 0; j < arguments; j++) {
        args[j] = $("<td>").text(arguments[j].Name);
      }
    }

    row.append(name);
    row.append(endpoint);
    row.append(requestType);
    row.append(arg1);
    row.append(arg2);
    row.append(arg3);
    row.append(arg4);
    row.append(arg5);
    row.append(arg6);
    $(table).append(row);
  }
}

function validateIPAddress(ip) {
	var ipNumbers = ip.split(".");
	var ipNums = new Array(4);
	if (ipNumbers.length !== 4) {
		return "";
	}
	for (let i = 0; i < 4; i++) {
		ipNums[i] = parseInt(ipNumbers[i]);
		if (ipNums[i] < 0 || ipNums[i] > 255) {
			return "";
		}
	}
	return ip;
}
