import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.DocumentBuilder;
import org.w3c.dom.Document;
import org.w3c.dom.NodeList;
import org.w3c.dom.Node;
import org.w3c.dom.Element;
import java.io.File;
import java.util.Map;
import java.util.HashMap;
import java.util.Iterator;
import java.util.StringJoiner;

public class XMLLangToJSON {
	private HashMap<String, String> defStrings;
	private HashMap<String, HashMap<String, String>> hLocales = new HashMap<String, HashMap<String, String>> ();

	public static void main(String argv[]) {
		XMLLangToJSON r = new XMLLangToJSON();
		if(argv.length < 2) {
			System.err.println(argv);
			System.err.println("USAGE:  java XMLLangToJSON <<basefile.xml>> <<localizedfile-la1.xml>> <<localizedfile-la2.xml>> etc. etc.");
			System.exit(1);
		}

		try {
			r.readInDefaultFile(argv[0]);
			r.readInLocaleFile("pt", argv[1]);
//			System.out.print(r.createJSONLocalizationString("pt"));
			System.out.print(r.createJSON());
		} catch 	(Exception e) {
			e.printStackTrace();
			System.exit(1);
		}
	}

	public static String quote2(String string) {
		return("\"" + string + "\"");
	}

	/** 
	 * Must be escaped to get rid of " and such.
	 * http://stackoverflow.com/questions/3020094/how-should-i-escape-strings-in-json
	 */
	public static String quote(String string) {
		if (string == null || string.length() == 0) {
			return "\"\"";
		}

		char         c = 0;
		int          i;
		int          len = string.length();
		StringBuilder sb = new StringBuilder(len + 4);
		String       t;

		sb.append('"');
		for (i = 0; i < len; i += 1) {
			c = string.charAt(i);

			switch (c) {
			case '\\':
			case '"':
				sb.append('\\');
				sb.append(c);
				break;
			case '/':
 //                if (b == '<') {
				sb.append('\\');
 //                }
				sb.append(c);
				break;
			case '\b':
				sb.append("\\b");
				break;
			case '\t':
				sb.append("\\t");
				break;
			case '\n':
				sb.append("\\n");
				break;
			case '\f':
				sb.append("\\f");
				break;
			case '\r':
				sb.append("\\r");
				break;
			case '\u2026':
			//  Handle ELLIPSIS.  The original strings.xml and localized .xml files contain
			//  The original … ellipsis character because eclipse suggests it when entered otherwise.
			//  Experimentation has shown that the localization for l10n.js only works when the 
			//  string "\u2026" appears in the mapping instead.
			//  &#8230;  …   \u2026  who knows what...
			//  even if we just appended "u2026" it would still convert it to an ellipsis char '…'
			//  So, here we substitute the string by escaping the preceding u.
			//  this results in the string "Advanced\u2026" appearing in the localization.js for ex.
				sb.append("...");
				break;
			default:
				if (c < ' ') {
					t = "000" + Integer.toHexString(c);
					sb.append("\\u" + t.substring(t.length() - 4));
				} else {
					sb.append(c);
				}
			}
		}
		sb.append('"');
		return sb.toString();
    }

	/**
	 * localizedQuote must convert unicode to escaped unicode for output.
	 */
	public static String localizedQuote(String string) {
		if (string == null || string.length() == 0) {
			return "\"\"";
		}

		char         c = 0;
		int          i;
		int          len = string.length();
		StringBuilder sb = new StringBuilder(len + 4);
		String       t;

		sb.append('"');
		for (i = 0; i < len; i += 1) {
			c = string.charAt(i);

			switch (c) {
			case '\\':
			case '"':
				sb.append('\\');
				sb.append(c);
				break;
			case '/':
 //                if (b == '<') {
				sb.append('\\');
 //                }
				sb.append(c);
				break;
			case '\b':
				sb.append("\\b");
				break;
			case '\t':
				sb.append("\\t");
				break;
			case '\n':
				sb.append("\\n");
				break;
			case '\f':
				sb.append("\\f");
				break;
			case '\r':
				sb.append("\\r");
				break;
			case '\u2026':
			//  Handle ELLIPSIS.  The original strings.xml and localized .xml files contain
			//  The original … ellipsis character because eclipse suggests it when entered otherwise.
			//  Experimentation has shown that the localization for l10n.js only works when the 
			//  string "\u2026" appears in the mapping instead.
			//  &#8230;  …   \u2026  who knows what...
			//  even if we just appended "u2026" it would still convert it to an ellipsis char '…'
			//  So, here we substitute the string by escaping the preceding u.
			//  this results in the string "Advanced\u2026" appearing in the localization.js for ex.
				sb.append("\\u2026");
				break;
			default:
				if (c < ' ') {
					t = "000" + Integer.toHexString(c);
					sb.append("\\u" + t.substring(t.length() - 4));
				//WARNING:  THE ORIGINAL ACCENTED CHARS DISPLAY PROPERLY IN BROWSER,
				// BUT MUST BE ESCAPED WITH \\U + CODE FOR ANDROID.  UGH!!!
				} else if((160 <= (int)c) && ((int)c <= 255)) {
					t = "000" + Integer.toHexString(c);
					sb.append("\\u" + t.substring(t.length() - 4));
				} else {
					sb.append(c);
				}
			}
		}
		sb.append('"');
		return sb.toString();
    }

    /**
	 * Read the contents of the localized file into a HashMap with the keys being
	 * the ID, and the value being the localized text.
	 */
	public void readInLocaleFile(String locale, String filename) throws Exception {
		HashMap<String, String> localStrings = new HashMap<String, String>();
		File fXmlFile = new File(filename);
		DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
		DocumentBuilder dBuilder = dbFactory.newDocumentBuilder();
		Document doc = dBuilder.parse(fXmlFile);
			
		//optional, but recommended
		//read this - http://stackoverflow.com/questions/13786607/normalization-in-dom-parsing-with-java-how-does-it-work
		doc.getDocumentElement().normalize();

		NodeList nList = doc.getElementsByTagName("string");
				
		for (int temp = 0; temp < nList.getLength(); temp++) {

			Node nNode = nList.item(temp);
				
			if (nNode.getNodeType() == Node.ELEMENT_NODE) {
				Element eElement = (Element) nNode;
				localStrings.put(eElement.getAttribute("name"), eElement.getTextContent());
			}
		}

		// add resulting HashMap to the Map of Maps, keyed by String locale.
		hLocales.put(locale, localStrings);
	}

	/**
	 * Read the contents of the default file (non-localized) into defStrings HashMap with key
	 * the VALUE OF THE STRING and value being the ID.  This seems BACKWARDS because we are 
	 * creating a way to quickly look up the ID from the passed in string to be localized.
	 * and the String will be used to look up the item in the localized file.
	 */
	public void readInDefaultFile(String filename) throws Exception {
		defStrings = new HashMap<String, String>();
		File fXmlFile = new File(filename);
		DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
		DocumentBuilder dBuilder = dbFactory.newDocumentBuilder();
		Document doc = dBuilder.parse(fXmlFile);
			
		//optional, but recommended
		//read this - http://stackoverflow.com/questions/13786607/normalization-in-dom-parsing-with-java-how-does-it-work
		doc.getDocumentElement().normalize();

		NodeList nList = doc.getElementsByTagName("string");
				
		for (int temp = 0; temp < nList.getLength(); temp++) {

			Node nNode = nList.item(temp);
				
			if (nNode.getNodeType() == Node.ELEMENT_NODE) {

				Element eElement = (Element) nNode;
				defStrings.put(eElement.getTextContent(), eElement.getAttribute("name"));
			}
		}
	}

	// public String createJSONLocalizationString(String lang) {
	// 	StringJoiner sj = new StringJoiner(",\n", "{\n", "\n}");
	// 	for (String key : defStrings.keySet() ) {
	// 		if(localStrings.get(defStrings.get(key)) != null) {
	// 			sj.add("\t" + quote(key) + " : " + quote(localStrings.get(defStrings.get(key))));
	// 		}
	// 	}
	// 	return(sj.toString());
	// }

	public String createDefaultsJSON() {
		StringJoiner sj = new StringJoiner(",\n", "\"en\": {\n", "\n},\n");
		for (String key : defStrings.keySet() ) {
			sj.add("\t" + quote(key) + " : " + localizedQuote(key));
		}
		return(sj.toString());
	}

	public String createLocaleJSON(String locale, HashMap<String, String> hLocale) {
		StringJoiner sj = new StringJoiner(",\n", quote(locale) + ": {\n", "\n}\n");
		for (String key : defStrings.keySet() ) {
			if(hLocale.get(defStrings.get(key)) != null) {
				sj.add("\t" + quote(key) + " : " + localizedQuote(hLocale.get(defStrings.get(key))));
			}
		}
		return(sj.toString());
	}

	public String createJSON() {
		StringBuffer sb = new StringBuffer();
		// beginning of js file:
		sb.append("String.toLocaleString({\n");
		sb.append(createDefaultsJSON());
		for(String localeKey : hLocales.keySet() ) {
			sb.append(createLocaleJSON(localeKey, hLocales.get(localeKey)));
		}

		// // iterate over each of the keys in hLocales (which are the locales, "en, pt" at first)
		// for(String localeKey : hLocales.keySet() ) {
		// 	// create a new StringJoiner for each locale:
		// 	StringJoiner sj = new StringJoiner(",\n", localeKey + ": {\n", "\n}");
		// 	// iterate over each of the embedded strings in each locale:
		// 	for(String key : defStrings.keySet() ) {
		// 		if(hLocales.get(localeKey).get(defStrings.get(key)) != null) {
		// 			// defStrings values : hLocales.get(localeKey).get
		// 			HashMap<String, String> tmpHash = hLocales.get(localeKey);
		// 			sj.add("\t" + quote(key) + " : " + quote(tmpHash.get(defStrings.get(key))));
		// 		}
		// 	}
		// 	sb.append(sj.toString());
		// }

		// end of js file:
		sb.append("});");
		return(sb.toString());
	}
}