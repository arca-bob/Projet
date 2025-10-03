//Recupèrer les contenant ou vont s'afficher les données récupérées

document.addEventListener("DOMContentLoaded", () => {
    const infoUser = document.querySelector(".user_info");
    const listTache = document.querySelector(".liste_tache_user");
    const addBtn = document.querySelector(".add_task");
    if (!infoUser || !listTache) return;

    //Récupere l'id de l'utilisateur dans l'url
    const params = new URLSearchParams(window.location.search);
    const rawId = params.get("userId");
    if (!rawId) {
        infoUser.textContent = "Aucun utilisateur spécifié.";
        return;
    }
    //Convertit l'id en nombre et verifie qu'il est valide
    const userId = Number(rawId);
        if (Number.isNaN(userId)) {
        infoUser.textContent = "Identifiant invalide.";
        return;
    }
    //Crée et affiche les tâches de l'utilisateur
    const renderTache = (tache, userName) => {
        //vide le conteneur
        listTache.innerHTML = "";
        const title = document.createElement("h3");
        title.textContent = `Tâches de ${userName}`;
        listTache.appendChild(title);
        //si pas de tache message d'erreur
        if (!Array.isArray(tache) || tache.length === 0) {
            const para = document.createElement("p");
            para.textContent = "Aucune tâche trouvée pour cet utilisateur.";
            listTache.appendChild(para);
            return;
        }

        const ul = document.createElement("ul");
        ul.className = "user_tache";
        ul.setAttribute("aria-label", `Tâches de ${userName}`);
        //parcour toute les taches récupérer de l'user et les ajoutes a la liste
        tache.forEach(task => {
            const li = document.createElement("li");
            li.className = "todo";

            const txt = document.createElement("span");
            txt.textContent = task.title;

            const status = document.createElement("small");
            status.textContent = task.completed ? " Complétée" : " En cours";

        li.appendChild(txt);
        li.appendChild(status);
        ul.appendChild(li);
        });
        listTache.appendChild(ul);
    };
    //Recupere les données de l'utilisateur et ses tâches
    const fetchUserAndTache = async (id) => {
        try {
            const [resUser, resTache] = await Promise.all([
            fetch(`https://jsonplaceholder.typicode.com/users/${id}`),
            fetch(`https://jsonplaceholder.typicode.com/todos?userId=${id}`)
            ]);

            if (!resUser.ok) throw new Error("Erreur lors de la récupération de l'utilisateur");
            if (!resTache.ok) throw new Error("Erreur lors de la récupération des tâches");

            const [user, tache] = await Promise.all([resUser.json(), resTache.json()]);

            infoUser.innerHTML = "";
            //Creer et affiche les infos de l utilisateur
            const name = document.createElement("h2");
            name.textContent = user.name ?? "Nom inconnu";

            const email = document.createElement("p");
            email.textContent = `Email: ${user.email ?? "-"}`;

            const phone = document.createElement("p");
            phone.textContent = `Téléphone: ${user.phone ?? "-"}`;

            infoUser.appendChild(name);
            infoUser.appendChild(email);
            infoUser.appendChild(phone);

            renderTache(tache, user.name ?? "utilisateur");
            return { user, tache };
        } catch (err) {
            //si erreur affiche message erreur
            infoUser.innerHTML = "";
            listTache.innerHTML = "";
            const para = document.createElement("p");
            para.textContent = "Erreur lors du chargement des données.";
            infoUser.appendChild(para);
            console.error(err);
            return null;
        }
    };
    //Stocke les taches et le nom de l'utilisateur pour une nouvvelle tache
    let currentTache = [];
    let currentUserName = "utilisateur";
    //Recupere les données de l'utilisateur et ses taches et les stockes
    fetchUserAndTache(userId).then(result => {
        if (result) {
            currentTache = Array.isArray(result.tache) ? result.tache.slice() : [];
            currentUserName = result.user.name ?? currentUserName;
        }
    });

    if (addBtn) {
        addBtn.addEventListener("click", async () => {
            const title = prompt("Titre de la nouvelle tâche");
            if (!title || !title.trim()) return;
            const newTask = {
                title: title.trim(),
                completed: false,
                 userId: userId
            };
            //si la tache est cree sans problème l'ajoute a la liste
            try {
                const res = await fetch(`https://jsonplaceholder.typicode.com/todos`, {
                    method: 'POST',
                    body: JSON.stringify(newTask),
                    headers: {
                    'Content-type': 'application/json; charset=UTF-8'
                    }
                });

                if (!res.ok) throw new Error("Échec de l'ajout de la tâche");
                //ajoute la tache au début du tableau et rafraichit l'affichage
                const created = await res.json();
                currentTache.unshift(created);
                renderTache(currentTache, currentUserName);
            } catch (err) {
                console.error(err);
                alert("Impossible d'ajouter la tâche, réessayez.");
            }
        });
    }
});
