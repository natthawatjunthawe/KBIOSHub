document.addEventListener("DOMContentLoaded", () => {
    const e = document.getElementById("navbar"),
          t = document.getElementById("custom-context"),
          n = document.getElementById("mobile-menu-btn"),
          o = document.getElementById("mobile-menu"),
          a = document.getElementById("mega-menu-overlay");
    let s = 0, i = !1;

    window.addEventListener("scroll", () => {
        const t = window.scrollY;
        t > s && t > 80 && !i ? e.classList.add("hidden") : e.classList.remove("hidden");
        s = t;
    }, { passive: !0 });

    document.addEventListener("contextmenu", e => {
        e.preventDefault();
        t.style.display = "flex";
        t.style.left = `${e.pageX}px`;
        t.style.top = `${e.pageY}px`;
    });

    document.addEventListener("click", ev => {
        t.style.display = "none";
    });

    n.addEventListener("click", ev => {
        ev.stopPropagation();
        const isActive = o.classList.contains("active");
        if (isActive) {
            o.classList.remove("active");
            i = !1;
        } else {
            o.classList.add("active");
            a.style.display = "none";
            document.querySelectorAll(".nav-item").forEach(el => { el.dataset.active = "0"; el.classList.remove("active"); });
            i = !0;
        }
    });

    const l = async () => {
        try {
            const res = await fetch("dataupdate.json", { cache: "no-cache" });
            if (!res.ok) throw new Error("ERR");
            const data = await res.json();
            document.documentElement.style.setProperty("--bg", data.config.theme.bg);
            document.documentElement.style.setProperty("--surface", data.config.theme.surface);
            document.documentElement.style.setProperty("--primary", data.config.theme.primary);
            document.documentElement.style.setProperty("--accent", data.config.theme.accent);
            r(data);
            c();
        } catch (err) {
            console.error(err);
            document.body.innerHTML = `<div style="padding:2rem;text-align:center"><h2>System Error</h2><button onclick="location.reload()">Retry</button></div>`;
        }
    };

    const buildMega = (items) => {
        let html = "";
        items.forEach(item => {
            html += `<div class="mega-col"><h4>${item.label}</h4>`;
            if (item.sub) {
                item.sub.forEach(subItem => {
                    html += `<a href="${subItem.url}">${subItem.label}</a>`;
                });
            }
            html += `</div>`;
        });
        return html;
    };

    const buildAccordion = (items) => {
        let html = "";
        items.forEach(item => {
            if (item.sub) {
                html += `<div class="accordion-item">
                    <button class="accordion-toggle">${item.label} <i class="fa-solid fa-chevron-down" style="font-size:0.8rem"></i></button>
                    <div class="accordion-content">
                        ${buildAccordion(item.sub)}
                    </div>
                </div>`;
            } else {
                html += `<a href="${item.url}" class="accordion-link">${item.label}</a>`;
            }
        });
        return html;
    };

    const r = data => {
        document.getElementById("site-title").textContent = data.config.siteName;
        document.getElementById("nav-logo").src = data.config.logo;
        document.getElementById("nav-name").textContent = data.config.siteName;

        const navLinksContainer = document.getElementById("nav-links");
        const mobileLinksContainer = document.getElementById("mobile-links");

        data.mainNav.forEach((item) => {
            const btn = document.createElement("button");
            btn.className = "nav-item";
            btn.innerHTML = `${item.label} <i class="fa-solid fa-chevron-down" style="font-size:0.6rem;margin-left:6px"></i>`;
            btn.addEventListener("click", ev => {
                ev.stopPropagation();
                const isActive = a.style.display === "grid" && btn.dataset.active === "1";
                document.querySelectorAll(".nav-item").forEach(el => { el.dataset.active = "0"; el.classList.remove("active"); });
                o.classList.remove("active");
                
                if (isActive) {
                    a.style.display = "none";
                    i = !1;
                } else {
                    btn.classList.add("active");
                    btn.dataset.active = "1";
                    a.innerHTML = buildMega(item.sub);
                    a.style.display = "grid";
                    i = !0;
                }
            });
            navLinksContainer.appendChild(btn);
        });

        const rBtn = document.getElementById("desktop-all-btn");
        rBtn.addEventListener("click", ev => {
            ev.stopPropagation();
            const isActive = a.style.display === "grid" && rBtn.dataset.active === "1";
            document.querySelectorAll(".nav-item").forEach(el => { el.dataset.active = "0"; el.classList.remove("active"); });
            o.classList.remove("active");

            if (isActive) {
                a.style.display = "none";
                i = !1;
            } else {
                rBtn.classList.add("active");
                rBtn.dataset.active = "1";
                a.innerHTML = buildMega(data.allNav);
                a.style.display = "grid";
                i = !0;
            }
        });

        mobileLinksContainer.innerHTML = buildAccordion([...data.mainNav, ...data.allNav]);
        mobileLinksContainer.querySelectorAll('.accordion-toggle').forEach(btn => {
            btn.addEventListener('click', (ev) => {
                ev.stopPropagation();
                const content = btn.nextElementSibling;
                const icon = btn.querySelector('i');
                const isVisible = content.style.display === "block";
                content.style.display = isVisible ? "none" : "block";
                icon.style.transform = isVisible ? "rotate(0deg)" : "rotate(180deg)";
            });
        });

        document.getElementById("hero-bg").style.backgroundImage = `url(${data.config.heroBg})`;
        document.getElementById("hero-title").textContent = data.config.heroTitle;
        document.getElementById("hero-sub").textContent = data.config.heroSub;

        const sectionsContainer = document.getElementById("content-sections");
        data.sections.forEach(sec => {
            const sectionEl = document.createElement("section");
            sectionEl.className = "section";
            sectionEl.id = sec.id;
            const titleEl = document.createElement("h2");
            titleEl.className = "section-title";
            titleEl.textContent = sec.title;
            sectionEl.appendChild(titleEl);
            
            const gridEl = document.createElement("div");
            gridEl.className = "grid";
            sec.items.forEach(item => {
                const cardEl = document.createElement("div");
                cardEl.className = "card";
                const mediaEl = document.createElement("div");
                mediaEl.className = "card-media";
                if (item.image) mediaEl.innerHTML += `<img src="${item.image}">`;
                if (item.video) mediaEl.innerHTML += `<video src="${item.video}" loop muted playsinline autoplay class="has-vid" ${!item.image ? 'style="opacity:1;z-index:1"' : ""}></video>`;
                
                const contentEl = document.createElement("div");
                contentEl.className = "card-content";
                if (item.badge) contentEl.innerHTML += `<div class="card-badge">${item.badge}</div>`;
                contentEl.innerHTML += `<h3 class="card-title">${item.title}</h3><p class="card-desc">${item.desc}</p><button class="card-more">Explore <i class="fa-solid fa-angle-right"></i></button>`;
                
                cardEl.innerHTML += `<a class="card-link-layer" href="${item.link}"></a>`;
                cardEl.append(mediaEl, contentEl);
                gridEl.appendChild(cardEl);
            });
            sectionEl.appendChild(gridEl);
            sectionsContainer.appendChild(sectionEl);
        });

        const fLinks = document.getElementById("footer-links");
        data.footer.links.forEach(link => { fLinks.innerHTML += `<a href="${link.url}">${link.label}</a>`; });
        
        const fSocials = document.getElementById("footer-socials");
        data.footer.socials.forEach(soc => { fSocials.innerHTML += `<a href="${soc.url}" data-tippy-content="${soc.tip}"><i class="${soc.icon}"></i></a>`; });
        
        document.getElementById("footer-copy").innerHTML = `&copy; ${data.config.siteName} ${data.config.year}`;
    };

    const c = () => {
        imagesLoaded(document.body, { background: !0 }, () => {
            const app = document.getElementById("app");
            const footer = document.getElementById("footer");
            app.style.opacity = "1";
            app.style.visibility = "visible";
            app.style.transform = "translateY(0)";
            footer.style.opacity = "1";
            footer.style.visibility = "visible";
            document.body.style.overflow = "auto";
            d();
        });
    };

    const d = () => {
        if (typeof tippy !== "undefined") tippy("[data-tippy-content]", { animation: "scale", theme: "light" });
        if (typeof Lenis !== "undefined") {
            const lenis = new Lenis({ duration: 1.2, easing: e => Math.min(1, 1.001 - Math.pow(2, -10 * e)), smoothWheel: !0, touchMultiplier: 2 });
            function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
            requestAnimationFrame(raf);
        }
        if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
            gsap.registerPlugin(ScrollTrigger);
            gsap.to(".hero-bg", { y: "20%", ease: "none", scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: !0 } });
            gsap.from(".hero-content > *", { y: 30, opacity: 0, duration: 1, stagger: .1, ease: "power3.out", delay: .2 });
            gsap.utils.toArray(".section-title").forEach(el => { gsap.from(el, { scrollTrigger: { trigger: el, start: "top 85%" }, y: 20, opacity: 0, duration: .8, ease: "power3.out" }); });
            gsap.utils.toArray(".grid").forEach(el => { gsap.from(el.querySelectorAll(".card"), { scrollTrigger: { trigger: el, start: "top 85%" }, y: 40, opacity: 0, duration: 1, stagger: .1, ease: "power3.out" }); });
        }
    };

    const m = setInterval(() => {
        if (window.imagesLoaded && window.gsap && window.ScrollTrigger && window.Lenis) {
            clearInterval(m);
            l();
        }
    }, 50);
});