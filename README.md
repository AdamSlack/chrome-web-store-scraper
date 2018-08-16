# chrome-web-store-scraper
A node js package for scraping the chrome web store.

# Requirements

This project requires selenium, a Web Browser Automation tool. The version of selenium can be downloaded from [seleniumhq](https://www.seleniumhq.org/P).

Selenium must also be installed and `selenium` must be on the system PATH. For linux, a `selenium` bash script is included that can be paired with the `selenium.jar` for ease of use.

# Selenium Setup.

The Selenium server must be on the system path as '`selenium`' the easiest way to set it up to work with the chrome web store scraper is to copy to make the `selenium` bash script in this project executable with `chmod +x selenium` and then copy that file, along with the selenium server `.jar` file to `/bin/` or somewhere similar.

When copying the selenium server `.jar` make sure it is renamed from `selenium-server-standalone-3.14.0.jar` to just `selenium.jar`.