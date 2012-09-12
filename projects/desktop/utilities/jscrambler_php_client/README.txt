/* 
 * Copyright 2012, 2012 AuditMark 
 *  
 * This program is free software: you can redistribute it and/or modify 
 * it under the terms of the GNU Lesser General Public License as published by 
 * the Free Software Foundation, either version 3 of the License, or 
 * (at your option) any later version. 
 * 
 * This program is distributed in the hope that it will be useful, 
 * but WITHOUT ANY WARRANTY; without even the implied warranty of 
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the 
 * GNU Lesser General Public License for more details. 
 * 
 * You should have received a copy of the Lesser GPL 
 * along with this program.  If not, see <http://www.gnu.org/licenses/> 
 */ 

//
// Content
//

This package contains two php files: 
* jscrambler.php - PHP client required to interacte with JScrambler API
* index.php - Simple post example

//
// Requirements
//

To use the JScrambler API and run the PHP client you need: 
* JScrambler premium subscription (http://jscrambler.com/service/purchase) 
* PHP 5.2.x or higher (http://php.net/downloads.php) 
* libcurl (http://pt.php.net/manual/en/curl.requirements.php)

More info at http://jscrambler.com/webapi/client

//
// Resources
//

Here is a summary of the available Web API resources:  

* POST /code.json - Request for a multiple JavaScript and HTML project obfuscation
* GET /code.json - Get information about your submitted projects
* GET /code/:project_id.json - Get information about the project and its sources with the specific :project_id
* GET /code/:project_id.zip - Download the zip archive containing the resulting project with the specific :project_id
* GET /code/:project_id/:source_id.json - Get information about the project source with the specific :source_id and :project_id
* GET /code/:project_id/:source_id.:extension - Download a project source with the specific :source_id and :extension belonging to the project with the specific :project_id
* DELETE /code/:project_id.json - Delete a project with the specific :project_id

More info at http://jscrambler.com/webapi/rest
