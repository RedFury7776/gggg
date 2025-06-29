document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;
    const themeToggle = document.getElementById("themeToggle");

    const setTheme = (isDark) => {
        if (isDark) {
            body.classList.add("dark-theme");
            localStorage.setItem("theme", "dark");
        } else {
            body.classList.remove("dark-theme");
            localStorage.setItem("theme", "light");
        }
    };

    // Event listener for the theme toggle button
    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const currentThemeIsDark = body.classList.contains("dark-theme");
            setTheme(!currentThemeIsDark); // Toggle the theme
        });
    }

    // Apply saved theme on page load
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        setTheme(true);
    } else {
        setTheme(false);
    }
});