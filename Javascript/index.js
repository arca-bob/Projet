//recupere les conteneurs où seront affichés les utilisateurs et les taches
document.addEventListener("DOMContentLoaded", () => {
    const container = document.querySelector(".liste_User");
    const searchInput = document.querySelector(".search"); 
    if (!container) return;
    //stocke les données en cache
    let cachedUsers = [];
    let cachedTacheByUser = {};
    //recupere les donnees depuis l'api et les mets en cache
    const fetchData = async () => {
        const [resUsers, resTache] = await Promise.all([
        fetch("https://jsonplaceholder.typicode.com/users"),
        fetch("https://jsonplaceholder.typicode.com/todos")
        ]);
        if (!resUsers.ok) throw new Error("Erreur users");
        if (!resTache.ok) throw new Error("Erreur todos");
        const [users, tache] = await Promise.all([resUsers.json(), resTache.json()]);
        cachedUsers = Array.isArray(users) ? users : [];
        cachedTacheByUser = Array.isArray(tache)
        ? tache.reduce((acc, task) => {
            const u_id = task.userId ?? 0;
            if (!acc[u_id]) acc[u_id] = [];
            acc[u_id].push(task);
            return acc;
        }, {})
        : {};
    };

    //Creer les élements à afficher dans la card
    const renderUsers = (usersToRender) => {
        //vide le conteneur
        container.innerHTML = "";
        const frag = document.createDocumentFragment();
        usersToRender.forEach(user => {
            const article = document.createElement("article");
            article.className = "user";
            article.dataset.id = user.id ?? "";

            const header = document.createElement("header");
            const name = document.createElement("h3");
            name.textContent = user.name ?? "Nom inconnu";
            name.className = "user_name";

            const username = document.createElement("p");
            username.className = "user_username";
            username.textContent = user.username ? `(${user.username})` : "";

            const email = document.createElement("p");
            email.className = "user_email";
            email.textContent = user.email ?? "";

            const phone = document.createElement("p");
            phone.className = "user_phone";
            phone.textContent = user.phone ?? "";

            //gère le clic de la card et redirige vers la page avec l'id de l'utilisateur correspondant
            article.tabIndex = 0;
            article.classList.add("user--clickable");
            article.addEventListener("click", () => {
            window.location.href = `user.html?userId=${encodeURIComponent(user.id)}`;
        });
        article.addEventListener("keydown", () => {
            article.click();
        
        });
        
        //ajoute les élements à la card
        header.appendChild(name);
        header.appendChild(username);
        header.appendChild(phone);
        header.appendChild(email);

        //affiche un nombre de tache donné liée à l'utilisateur
        const userTache = cachedTacheByUser[user.id] ?? [];
        const shownTache = userTache.slice(0, 1);
        
        const ul = document.createElement("ul");
        ul.className = "user_tache";
        ul.setAttribute("aria-label", `Tâches de ${user.name}`);

        if (shownTache.length === 0) {
                const li = document.createElement("li");
                li.textContent = "Aucune tâche trouvée.";
                ul.appendChild(li);
        } else {
            //Creer la taches
            shownTache.forEach(task => {
                const li = document.createElement("li");
                li.className = "todo";
                const title = document.createElement("span");
                title.textContent = task.title;
                title.className = "todo_title";
                const status = document.createElement("span");
                status.className = "todo_status";
                status.textContent = task.completed ? " Complétée" : " En cours";
                li.appendChild(title);
                li.appendChild(status);
                ul.appendChild(li);
            });
        }
        //ajoute la tache à la card
        article.appendChild(header);
        article.appendChild(ul);
        frag.appendChild(article);
        });
        container.appendChild(frag);
    };
    //Permet de filtrer les utilisateurs en fonction de la recherche
    const applyFilter = (query) => {
        if (!query) {
            renderUsers(cachedUsers);
            return;
        }
        //Transforme la recherche et les utilisateurs en cache en minuscule, les compares et affiche le rsultat
        const qlower = query.trim().toLowerCase();
        const filtered = cachedUsers.filter(user => {
            return (user.name && user.name.toLowerCase().includes(qlower))
            || (user.username && user.username.toLowerCase().includes(qlower))
            || (user.email && user.email.toLowerCase().includes(qlower));
        });
        renderUsers(filtered);
    };
    //affiche les utilisateurs et gère la barre de recherche
    const init = async () => {
        try {
            await fetchData();
            renderUsers(cachedUsers);
            if (searchInput) {
                searchInput.addEventListener("input", (e) => {
                    const value = e.target.value;
                    //si la recherche est trop courte affiche tout
                    if (value.length < 1) {
                        applyFilter("");
                    return;
                    }
                    applyFilter(value);
                });
            }
        } catch (err) {
            //creer et affiche un message en cas d erreur
            container.innerHTML = "";
            const para = document.createElement("p");
            para.className = "error";
            para.textContent = "Une erreur est survenue lors du chargement des données.";
            container.appendChild(para);
            console.error(err);
        }
    };

    init();
});

