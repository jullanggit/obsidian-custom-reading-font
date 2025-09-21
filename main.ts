import {
	App,
	Editor,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";

export default class CustomReadingFontPlugin extends Plugin {
	settings: CustomReadingFontSettings;

	async onload() {
		await this.loadSettings();

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new CustomReadingFontSettingsTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData(),
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async injectStyle() {}
}

interface CustomReadingFontSettings {
	pathRegex: string;
	fontFamily: string;
	fontPath: string | null;
}

const DEFAULT_SETTINGS: CustomReadingFontSettings = {
	pathRegex: "Books\/.*",
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
			.setDesc("Optional path to the font file")
			.addText((text) =>
				text
					.setPlaceholder(DEFAULT_SETTINGS.fontPath)
					.setValue(this.plugin.settings.fontPath)
					.onChange(async (value) => {
						this.plugin.settings.fontPath = value;
						await this.plugin.saveSettings();
					}),
			);
	}
}
