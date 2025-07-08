```py
# Routes
API_URL = "api.langaracourses.ca"

@app.route('/')
def index():
    yearterm = request.args.get('term', default=None, type=str)
    if yearterm != None and (len(yearterm) != 6 or not yearterm.isdigit()):
        raise APIProblem("Invalid term. Must follow year + term format. e.g. (202510)", 404)

    index_semesters = api_request(API_URL + "/v1/index/semesters")["semesters"]
    transfer_destinations = api_request(API_URL + "/v1/index/transfer_destinations")["transfers"]
    latest_semester = api_request(API_URL + "/v1/index/latest_semester")
    
    year = None
    term = None
    
    if yearterm == None:
        year, term = latest_semester['year'], latest_semester['term']
    else:
        year, term = int(yearterm[:4]), int(yearterm[4:6])
        
    if term not in [10, 20, 30]:
        raise APIProblem("Term must be 10, 20, or 30.", 404)

    if year < 1999 or year > latest_semester['year']:
        raise APIProblem("Couldn't find that semester", 404)

    
    latest_courses = api_request(API_URL + f"/v1/semester/{year}/{term}/courses")["courses"]
    latest_sections = api_request(API_URL + f"/v1/semester/{year}/{term}/sections")["sections"]

    # map each sections to the course object because that makes our life easier
    sections_dict = defaultdict(list)
    for section in latest_sections:
        key = (section['subject'], section['course_code'])
        sections_dict[key].append(section)

    for course in latest_courses:
        key = (course['subject'], course['course_code'])
        course["sections"] = sections_dict.get(key, [])

    return render_template('planner.html', year=year, term=term, latest_semester=latest_semester, courses=latest_courses,
                           transfer_destinations=transfer_destinations, semesters=index_semesters)
```

```html
<!DOCTYPE html>
<html lang="en">

<head>

    <!--Load stylesheet-->
    <link rel="preload" href="/styles.css" as="style">
    <link rel="stylesheet" type="text/css" href="/styles.css">

    <!--Load Fullcalendar -->
    <script src='/libraries/fullcalendar/dist/index.global.min.js'></script>
    <script src='/js/FCalendarHelpers.js' defer></script>

    <script type="text/javascript">
        const year = {{year}}
        const term = {{term}}
        
        const courses = {{ courses|tojson|safe }}
        const transfer_destinations = {{ transfer_destinations|tojson|safe }}
        const semesters = {{ semesters|tojson|safe }}

        {# var sections = {{ sections|tojson|safe }} #}
        var database = null
    </script>
    <script src='planner.js' defer></script>

</head>

<body>
    
    <div class="container">

        <div id="sidebar" class="sidebar">

            <fieldset id="modeSelector" class="header-button-bar hidden">
                <label>
                    <input type="button" id="mode1Button" class="buttonSelected" value="Langara Course Planner">
                </label>
                <title>Langara Course Planner</title>
                <br>
                <label>
                    <input type="button" id="colorModeButton" value="🌒">
                </label>
            </fieldset>

            <fieldset id="schSelector" class="header-button-bar hidden">
                <label>
                    <input type="button" id="sch1Button" class="buttonSelected" value="Schedule 1">
                </label>
                <label>
                    <input type="button" id="sch2Button" value="Sch. 2">
                </label>
                <label>
                    <input type="button" id="sch3Button" value="Sch. 3">
                </label>
                <label>
                    <input type="button" id="sch4Button" value="Sch. 4">
                </label>
            </fieldset>

            <div id="sidebar_mode1">
                <div class="search">
                    <input type="text" id="courseSearchBar" placeholder="Search courses">
                    <label>
                        <p id="searchResults">Loading courses...</p>
                    </label>
                </div>

                <fieldset class="search-options" id="search-options">

                    <label>Select term:
                        <select id="termSelector">
                            {% for semester in semesters %}
                            <option value={{semester.id}} {{'selected' if term == semester.term and year == semester.year}}>
                                {{ semester.year }} {{semester.term|num_to_term}}
                            </option>
                            {% endfor %}
                        </select>
                    </label>

                    <!--<label>
                        <input type="checkbox" id="conflictCheckbox"> Hide courses that conflict with selected courses.
                    </label>-->
                    <label class="hidden">
                        <input type="checkbox" id="showColors" checked> Highlight courses by seats available.
                    </label>
                    <label class="hidden">
                        <input type="checkbox" id="notesCheckbox" checked> Show course notes (where available).
                    </label>
                    <label class="hidden">
                        <input type="checkbox" id="weekendCheckbox"> Always show Saturday.
                    </label>

                    <div class="button-container">
                        <label>
                            <input type="button" id="showAllButton" value="Show all in sidebar.">
                        </label>
                        <label>
                            <input type="button" id="hideAllButton" value="Hide all in sidebar.">
                        </label>
                        <label>
                            <input type="button" id="clearButton" value="Hide all courses.">
                        </label>
                    </div>



                </fieldset>
                
                <!-- the important part-->
                <div id="courselist" class="sidebarlist">

                    {% for course in courses if course.sections %}    
                        
                        
                        
                        {% for section in course.sections %}
                        <div id="{{ section.id }}" class="section 
                            {% if section.seats|int == 0 %}
                                red
                            {% elif section.seats|int <= 10 %}
                                yellow
                            {% else %}
                                green
                            {% endif %}">

                            <h3><a class="cl" href="https://planner.langaracs.ca/courses/{{ course.subject }}/{{ course.course_code }}" target="_blank">{{ course.subject }} {{ course.course_code }} {{section.section}}: {{course.attributes.abbreviated_title}}</a></h3>
                            
                            <span>{{section.seats}} seats available. {{section.waitlist}}{{'None' if section.waitlist == " "}} on waitlist.</span>

                            <div class="schedules">
                                {% for schedule in section.schedule %}
                                <span>{{schedule.type}} {{schedule.days}} {{schedule.time}} {{schedule.room}} {{schedule.instructor}}</span>
                                <br>
                                {% endfor %}
                            </div>

                            {% if section.notes != none%} 
                            <span>{{section.notes}}</span>
                            {% endif %}
                            
                        </div>
                        {% endfor%}

                    {% endfor %}
                    <!--<div class="csidebar">
                        <h3>INSERT COURSES HERE</h3>
                        <p>This should only take a few seconds.</p>
                    </div> -->
                    <!-- Add more course entries here -->
                </div>
            </div>



            <div id="sidebar_mode2" class="hidden">

                <fieldset id="timetableGeneratorSearch">
                    <label>Select term:
                        <select id="termSelector2">
                            <select id="termSelector">
                                {% for semester in semesters %}
                                <option value={{semester.id}}>{{semester.term|num_to_term}} {{ semester.year }}</option>
                                {% endfor %}
                            </select>
                        </select>
                    </label>
                    <input type="text" id="timetableField1" placeholder="Course #1..." value="cpsc 1030 OR cpsc 1045 NOT 0830">
                    <input type="text" id="timetableField2" placeholder="Course #2..." value="cpsc 2190 and a275">
                    <input type="text" id="timetableField3" placeholder="Course #3..." value="cpsc 2280">
                    <input type="text" id="timetableField4" placeholder="Course #4...">
                    <input type="text" id="timetableField5" placeholder="Course #5...">
                    <input type="text" id="timetableField6" placeholder="Course #6...">
                    <label>
                        <input type="button" id="generateTimetableButton" value="Generate Potential Timetables.">
                    </label>
                    <p id="timetableText"></p>
                </fieldset>

                <div id="timetablecourselist" class="sidebarlist">
                    <!-- Add timetables here -->
                </div>

            </div>

            <div id="sidebar_mode3" class="hidden">
                <div class="csidebar savediv green" id="betterSaveButton"><h3><span>Click here to create a new save.<br>(note: it will not autosave)</span></h3></div>

                <div id="savedSchedulesList" class="sidebarlist">
                    <!-- Add timetables here -->
                </div>
            </div>

            <div id="sidebar_mode4" class="hidden"> 

                <div class="sidebarlist">
                    <h1>Thank you for using the Langara Course Planner!</h1>

                    <p>This website was developed by Anderson Tseng in collaboration with the Langara Computer Science Club.</p>

                    <p>It uses data parsed from the Langara Course Search and BCTransferPlanner.</p>
                </div>
                
            </div>

            <footer id="footer" class="footer">
                <a href="about" target="_blank">About</a>
                •
                <a href="https://github.com/Highfire1/LangaraCoursePlanner" target="_blank">Github</a>
                •
                <a href="https://forms.gle/CYKP7xsp2an6gNEK9" target="_blank">Provide Feedback</a>
            </footer>


        </div>

        <div id="calendarwrapper" class="calendar">
            <div id='calendar'></div>
        </div>

    </div>
</body>


</html>
```

FCalendarHelpers.js
```js
'use strict'


function showFCalendar(FCalendar, section_object, color_class = "#9ac7f7", semester_first_day="1970-01-01T00:00:00Z", semester_last_day="2025-02-03T00:00:00Z") {
    // This looks like technical debt that I will pay for but it is a quick fix
    if (section_object.rendered) {
        throw Error("Trying to show already rendered object.")
        // return
    }

    for (let schedule of section_object.schedule) {

        if (schedule.days === "-------") 
            continue // if there's no time slot then we don't need to render it
        
        if (schedule.days.trim() === "") 
            continue // cancelled courses have no time data
        

        

        // Don't do the hard work of parsing data if we already have an Event Object
        if(schedule.FCalendar_object != undefined) {
            if (section_object.weekends) {
                FCalendar.setOption('hiddenDays', [0])
            }
            schedule.FCalendar_object_raw["backgroundColor"] = color_class
            let obj = FCalendar.addEvent(schedule.FCalendar_object_raw)
            schedule.FCalendar_object = obj
            continue
        }

        // convert M-W---- to [1, 3]
        let value = 1
        let days = []
        for (const c of schedule.days) {
            if (!(c === '-')) {
                days.push(value)
            }
            value = (value + 1) % 7
        }
        if (days.includes(6)){
            section_object.weekends = true
            FCalendar.setOption('hiddenDays', [0])
        }

        let times = schedule.time.split("-")
        let s_time = times[0].slice(0, 2) + ":" + times[0].slice(2, 4)
        let e_time = times[1].slice(0, 2) + ":" + times[1].slice(2, 4)

        let start = null
        if (schedule.start) {
            start = new Date(schedule.start)
        } else if (courses_first_day !== null)
            start = courses_first_day

        let end = null
        if (schedule.end)
            end = new Date(new Date(schedule.end).getTime() + 86400000) // add 24 hours
        else if (courses_last_day !== null)
            end = courses_last_day
        else if (start !== null) 
            end = new Date(start.getTime() + 3600000 * 24 * 7 * 12) // 14 weeks in ms
        
        
        let f = {
            id: schedule.id,
            title: `${section_object.subject} ${section_object.course_code} ${section_object.section} ${section_object.crn} ${schedule.type} ${schedule.room}`,
            description: `${section_object.subject} ${section_object.course_code} ${section_object.section} ${section_object.crn} <br> ${schedule.type} ${schedule.room}`,
            startRecur: start,
            endRecur: end, // add 24 hours to the date to show 1 day events
            daysOfWeek: days,
            startTime: s_time,
            endTime: e_time,
            backgroundColor: color_class,
            // classNames: ["calendartxt", `${section_object.id}fc`, color_class],
            resourceId: schedule.room,
            overlap: false,
            // extendedProps: {
            //     course_code: this
            // },
            source: "json"
        }
        console.log(f)

        let FCalendar_object = FCalendar.addEvent(f)

        //console.log(f)
        schedule.FCalendar_object = FCalendar_object
        schedule.FCalendar_object_raw = f
    }

    // console.log("set rendered to true")
    section_object.rendered = true
    if (section_object.weekends) {
        saturday_courses += 1
        if (saturday_courses == 1) {
            FCalendar.setOption('hiddenDays', [0])
        }
    }
}


function hideFCalendar(FCalendar, section_object) {
    if (!section_object.rendered) {
        console.log(section_object)
        throw Error("Trying to hide section that is not rendered." )
    }

    for (let schedule of section_object.schedule) {
        // online sections won't have an associated FCalendar_object
        if (schedule.FCalendar_object != undefined)
            schedule.FCalendar_object.remove()
    }

    // console.log("set rendered to false")
    section_object.rendered = false
    if (section_object.weekends) {
        saturday_courses -= 1

        if (saturday_courses == 0)
            FCalendar.setOption('hiddenDays', [0, 6])
    }
```

planner.js
```js
'use strict'

// GLOBALS
var saturday_courses = 0
var sections = []
var FCalendar
var ghost_section = null
var ghost_section_sidebar = null

// const API_URL = "http://127.0.0.1:8000"
const API_URL = "https://coursesapi.langaracs.ca"

for (let course of courses) {

    if (course.sections == null) {
        continue
    }

    for (let s of course.sections) {
        s.rendered = false // whether the section is visible on the calendar
        s.selected = false // whether the section is selected
        s.ghost = false // whether the section is ghosted (ie in preview mode)
        s.weekends = false // whether the course has weekend or not
        s.parent = course
        sections.push(s)
    }
}

var courses_first_day = null
var courses_last_day = null

if (year==2025 && term == 10) {
    courses_first_day = new Date("2025-01-08")
    courses_last_day = new Date("2025-04-04")
} else if (year==2025 && term == 20) {
    courses_first_day = new Date("2025-05-05") 
    courses_last_day = new Date("2025-08-01")
} else if (year==2025 && term == 30) {
    courses_first_day = new Date("2025-09-02")
    courses_last_day = new Date("2025-12-01")
} else {
    courses_first_day = new Date(`${year}-01-08`)
    courses_last_day = new Date(`${year}-04-04`)
}


FCalendar = new FullCalendar.Calendar(document.getElementById('calendar'), {
    schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives',

    // wait 5 milliseconds before rendering events
    rerenderDelay: 5,

    // resource stuff
    resourceGroupField: 'groupId',
    resourceGroupLabelContent: function (arg) { return timelineLabelApplier(arg.groupValue) },
    // resources: function (fetchInfo, successCallback, failureCallback) { successCallback(c.generateResources()) },
    resourceAreaWidth: "120px",

    // show course section information when clicked
    eventClick: function (eventClickInfo) {
        let tags = eventClickInfo.event.id.split("-")

        console.log(tags)
    },

    // calendar stuff
    timeZone: 'America/Vancouver',
    initialView: 'timeGridWeek', // 'resourceTimelineDay'
    slotMinTime: "07:00", // classes start 7:30 and end 9:30
    slotMaxTime: "22:00",
    displayEventTime: false, // honestly not sure what this does

    headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
        //   right: 'resourceTimelineDay,resourceTimelineWeek dayGridMonth,timeGridWeek,timeGridDay'
    },

    //weekends: document.getElementById("weekendCheckbox").checked,
    hiddenDays: [0, 6],
    //initialDate: new Date(new Date(calendarClass.courses_first_day).getTime() + 604800000), // start on the second week of courses
    slotEventOverlap: false, // I also don't know what this does
    allDaySlot: false, // don't show the allday row on the calendar

    // fires when event is created, adds a second line of text to each event because you can't by default ._.
    // also makes it an <a>
    eventContent: function (info) {
        let p = document.createElement('div')

        let a = document.createElement('a')
        let s = document.createElement('span')

        let tags = info.event.extendedProps["description"].split(" ")

        a.innerHTML = tags[0] + " " + tags[1]
        a.href = `https://planner.langaracs.ca/courses/${tags[0]}/${tags[1]}`
        a.target = "_blank"

        tags.shift()
        tags.shift()

        s.innerHTML = "&nbsp;" + tags.join(" ")

        p.classList.add("event")
        p.appendChild(a)
        p.appendChild(s)

        return { domNodes: [p] }
    },

})

FCalendar.gotoDate(new Date(new Date(courses_first_day).getTime() + 604800000))


document.addEventListener('DOMContentLoaded', function () {
    FCalendar.render();
    onResize()
})


// async function fetchDB() {
//     const initSqlJs = window.initSqlJs;

//     const sqlPromise = await initSqlJs({
//         locateFile: file => `libraries/sql/sql.wasm`
//     });

//     const DB_API = "http://127.0.0.1:8000/v1/export/database.db"

//     try {
//         const dataPromise = fetch(DB_API, { cache: "no-cache" }).then(res => {
//             if (!res.ok) {
//                 throw new Error(`Failed to fetch data from ${DB_API}`);
//             }
//             return res.arrayBuffer();
//         });

//         const [SQL, buf] = await Promise.all([sqlPromise, dataPromise]);
//         const db = new SQL.Database(new Uint8Array(buf));

//         database = db
//         console.log(database)

//     } catch (error) {
//         throw error
//     }
// }

// fetchDB()
// console.log(database)

function getSectionVariable(section_id) {
    for (let s of sections) {
        if (s.id == section_id)
            return s
    }
    throw Error(`Didn't find ${section_id}`)
}



function getSidebarEventTarget(event, skiptitle = true) {
    let target = event.target

    // do nothing if we click the link on h3
    // unless we want to skip because we want to ghost on hover
    // TODO: flip this conditional
    if (target.nodeName == "A") {
        if (skiptitle)
            return null
        else
            target = target.parentElement
    }

    // do nothing if we click on the gap between courses
    if (target.nodeName == "DIV" && target.id == "courselist") {
        return null
    }

    // else put it on the calendar
    if (target.nodeName != "DIV")
        target = target.parentElement
    if (target.nodeName == 'DIV' && target.id == "")
        target = target.parentElement

    if (!(target.classList.contains("section"))) {
        console.log(`Original and final target:`)
        console.log(event.target)
        console.log(target)
        throw Error("Unexpected element clicked in sidebar.")
    }

    return target
}

document.getElementById("showAllButton").addEventListener("click", function (event) {
    let course_list = document.getElementById("courselist")
    for (let s of course_list.children) {
        if (s.classList.contains("hidden"))
            continue
        let section_object = getSectionVariable(s.id)
        if (!section_object.rendered)
            showSection(section_object, s)
    }
})

document.getElementById("clearButton").addEventListener("click", function (event) {
    let course_list = document.getElementById("courselist")
    for (let s of course_list.children) {
        let section_object = getSectionVariable(s.id)
        if (section_object.selected)
            hideSection(section_object, s)
    }
})

document.getElementById("hideAllButton").addEventListener("click", function (event) {
    let course_list = document.getElementById("courselist")
    for (let s of course_list.children) {
        if (s.classList.contains("hidden"))
            continue
        let section_object = getSectionVariable(s.id)
        if (section_object.selected)
            hideSection(section_object, s)
    }
})

document.getElementById("courselist").addEventListener("click", function (event) {
    let target = getSidebarEventTarget(event)
    if (target == null)
        return

    let section_object = getSectionVariable(target.id)

    if (!section_object.selected) {
        showSection(section_object, target)
    } else {
        hideSection(section_object, target, true)
    }
    // TODO: if we check for conflicts
    // c.courselistUpdate()
})

function showSection(section_object, sidebar_html) {
    if (section_object.ghost)
        unghostSection(section_object)
    showFCalendar(FCalendar, section_object)
    if (sidebar_html != null)
        sidebar_html.classList.add("blue")
    section_object.selected = true
}

function hideSection(section_object, sidebar_html, reghost_section = false, saturday_courses) {
    hideFCalendar(FCalendar, section_object)
    sidebar_html.classList.remove("blue")
    section_object.selected = false
    // we can take the shortcut of reghosting the course since mouse will always be over
    // only when we're hiding one course at once/following the cursor
    if (reghost_section)
        ghostSection(section_object, sidebar_html)
}

function ghostSection(section_object, sidebar_html) {
    if (section_object.ghost)
        throw Error("Trying to ghost object that is already ghosted.")


    if (ghost_section) {
        // this happens if you go too fast and the event listeners can't keep up
        // console.warn("Unghosted previous ghost before creating new ghost.")
        unghostSection(ghost_section)
    }

    ghost_section = section_object
    showFCalendar(FCalendar, ghost_section, "#b7b2b2")
    ghost_section.ghost = true
    ghost_section_sidebar = sidebar_html
    // ghost_section_sidebar.classList.add("dark-gray")
}

function unghostSection(section_object) {
    if (!section_object.ghost)
        throw Error("Trying to unghost object that is not a ghost.")

    hideFCalendar(FCalendar, ghost_section)
    ghost_section.ghost = false
    ghost_section_sidebar.classList.remove("dark-gray")
    ghost_section = null
    ghost_section_sidebar = null
}

document.getElementById("courselist").addEventListener("mousemove", function (event) {
    let target = getSidebarEventTarget(event, false)
    if (target == null)
        return

    let section_object = getSectionVariable(target.id)

    // don't ghost something that's already ghosted
    if (section_object == ghost_section)
        return

    // don't ghost a section that is selected
    if (section_object.selected)
        return

    // hide the previous ghost, if there is a previous ghost
    if (ghost_section != null) {
        unghostSection(ghost_section)
    }

    if (section_object.shown)
        return

    ghostSection(section_object, target)
})

// make sure ghosting stops when mouse leaves
document.getElementById("courselist").addEventListener("mouseleave", function (event) {
    if (!ghost_section)
        return

    hideFCalendar(FCalendar, ghost_section)
    ghost_section.ghost = false
    // ghost_section_sidebar.classList.remove("dark-gray")
    ghost_section = null
    ghost_section_sidebar = null
})


// search bar
let debounceTimeout;
document.getElementById("courseSearchBar").addEventListener("input", function (event) {

    // When we have to search lots of courses, use debounce so the page doesn't lag as much
    // set high debounce when the search would return a large number of results

    let debounceTime = ((4 - event.target.value.length) * 50)
    debounceTime = Math.max(debounceTime, 100)

    clearTimeout(debounceTimeout)

    debounceTimeout = setTimeout(function () {
        sendSearchQuery()
    }, debounceTime)

});

async function sendSearchQuery() {
    let query = document.getElementById("courseSearchBar").value

    const response = await fetch(`${API_URL}/v1/search/sections?query=${query}&year=${year}&term=${term}`)
    let search_results = await response.json()

    document.getElementById("searchResults").textContent = `Found ${search_results.sections.length} sections.`
    console.log(search_results)
    filterSidebarCourses(search_results.sections)
}
sendSearchQuery()

function filterSidebarCourses(sections_to_be_shown) {
    let course_list = document.getElementById("courselist")

    for (let s of course_list.children) {
        // let section_object = getSectionVariable(s.id)

        if (sections_to_be_shown.includes(s.id)) {
            s.classList.remove("hidden")
        } else {
            s.classList.add("hidden")
            // hide course
        }
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const termSelector = document.getElementById("termSelector");
    const yearTerm = `SMTR-${year}-${term}`;

    for (const option of termSelector.options) {
        if (option.value === yearTerm) {
            option.selected = true;
            break;
        }
    }
});

document.getElementById("termSelector").addEventListener("input", async function (event) {
    let new_yearterm = event.target.value
    new_yearterm = new_yearterm.replace("SMTR-", "").replace("-", "")
    console.log(new_yearterm)
    window.location.href = `?term=${new_yearterm}`

})

// Implement resizeability for the sidebar
// I would love to do this in css but it refuses to cooperate
function onResize(event) {
    const sidebarWidth = document.getElementById("sidebar").offsetWidth
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)

    // Don't make the calendar too small on mobile, even if it overflows
    const finalWidth = Math.max(400, vw - sidebarWidth - 20)

    const newwidth = `${finalWidth}px`

    if (document.getElementById("calendarwrapper").style.width == newwidth)
        return

    document.getElementById("calendarwrapper").style.width = newwidth

    FCalendar.updateSize()
}

document.addEventListener("DOMContentLoaded", onResize());

addEventListener('mousemove', (event) => {
    if (event.buttons === 1) { onResize() } // Not ideal but I can't think of a better way to check for resize
})
addEventListener("mouseup", onResize)
addEventListener("resize", onResize);


// Dark & Light mode
const useDark = window.matchMedia("(prefers-color-scheme: dark)");

function toggleDarkMode(state) {
    //   if (!CONSTANTS.dark_mode_enabled) 
    //     return

    document.documentElement.classList.toggle("dark-mode", state)
    document.getElementById("footer").classList.toggle("dark-mode", state)

    const button = document.getElementById("colorModeButton");
    if (state) {
        button.value = "☀️";
    } else {
        button.value = "🌒";
    }
}

// toggleDarkMode(useDark.matches);

useDark.addEventListener("change", (evt) => toggleDarkMode(evt.matches));

document.getElementById("colorModeButton").addEventListener("click", () => {
    document.documentElement.classList.toggle("dark-mode");
    document.getElementById("footer").classList.toggle("dark-mode")

    const root = document.documentElement;
    const button = document.getElementById("colorModeButton");

    if (root.classList.contains("dark-mode")) {
        button.value = "☀️";
    } else {
        button.value = "🌒";
    }
});

function termToSeason(term) {
    switch (term) {
        case 10:
            return "Spring"
        case 20:
            return "Summer"
        case 30:
            return "Fall"
        default:
            return "Unknown"
    }
}
```