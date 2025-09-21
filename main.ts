import {
	App,
	Plugin,
	PluginSettingTab,
	Setting,
	TFile,
	MarkdownView,
} from "obsidian";

export default class CustomReadingFontPlugin extends Plugin {
	settings: CustomReadingFontSettings;

	async onload() {
		await this.loadSettings();

		this.injectStyle();

		this.registerEvent(
			this.app.workspace.on("file-open", () => {
				this.injectStyle();
			}),
		);

		this.addSettingTab(new CustomReadingFontSettingsTab(this.app, this));
	}

	onunload() {
		document.getElementById("custom-reading-font-style")?.remove();
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData(),
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
		this.injectStyle();
	}

	async injectStyle() {
		document.getElementById("custom-reading-font-style")?.remove();

		if (!this.settings.pathRegex) return;

		let fontFaceRule = "";

		// build font face rule
		if (this.settings.fontPath) {
			const file = this.app.vault.getAbstractFileByPath(
				this.settings.fontPath,
			);
			if (file instanceof TFile) {
				const fontUrl = this.app.vault.getResourcePath(file);
				fontFaceRule = `
					@font-face {
						font-family: '${this.settings.fontFamily}';
						src: url('${fontUrl}');
						font-weight: normal;
						font-style: normal;
					}
				`;
			}
		}

		// Build regex
		// TODO: see if this can be done on setting the setting
		let regex: RegExp;
		try {
			regex = new RegExp(this.settings.pathRegex);
		} catch (e) {
			console.error("Invalid regex in CustomReadingFontPlugin:", e);
			return;
		}

		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!view) return;

		const file = view.file;
		if (!file) return;

		const matches = regex.test(file.path);
		if (!matches) return;

		const style = document.createElement("style");
		style.id = "custom-reading-font-style";
		style.textContent = `
			${fontFaceRule}

			/* Only affect reading mode */
			.markdown-preview-view {
				font-family: '${this.settings.fontFamily}';
			}
		`;

		document.head.appendChild(style);
	}
}

interface CustomReadingFontSettings {
	pathRegex: string;
	fontFamily: string;
	fontPath: string | null;
}

const DEFAULT_SETTINGS: CustomReadingFontSettings = {
	pathRegex: "Books\\/.*",
	fontFamily: "Fast_Serif",
	fontPath: "Fonts/Fast_Serif.ttf",
};

class CustomReadingFontSettingsTab extends PluginSettingTab {
	plugin: CustomReadingFontPlugin;

	constructor(app: App, plugin: CustomReadingFontPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName("Path Regex")
			.setDesc(
				"Regex to control which files the font should be enabled for",
			)
			.addText((text) =>
				text
					.setPlaceholder(DEFAULT_SETTINGS.pathRegex)
					.setValue(this.plugin.settings.pathRegex)
					.onChange(async (value) => {
						this.plugin.settings.pathRegex = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Font Family")
			.setDesc("Which font family to use")
			.addText((text) =>
				text
					.setPlaceholder(DEFAULT_SETTINGS.fontFamily)
					.setValue(this.plugin.settings.fontFamily)
					.onChange(async (value) => {
						this.plugin.settings.fontFamily = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Font Path")
			.setDesc("Optional path to a font file inside the vault")
			.addText((text) =>
				text
					.setPlaceholder(DEFAULT_SETTINGS.fontPath ?? "")
					.setValue(this.plugin.settings.fontPath ?? "")
					.onChange(async (value) => {
						this.plugin.settings.fontPath = value || null;
						await this.plugin.saveSettings();
					}),
			);
	}
}
